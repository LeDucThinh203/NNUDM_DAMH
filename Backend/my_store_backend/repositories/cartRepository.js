import db from '../db.js';

const mapCartRow = (row) => ({
  cart_item_id: row.cart_item_id,
  product_sizes_id: row.product_sizes_id,
  id: row.product_id,
  size: row.size_name,
  name: row.product_name,
  description: row.description,
  price: Number(row.sale_price || 0),
  original_price: Number(row.original_price),
  discount_percent: Number(row.discount_percent || 0),
  image: row.image,
  quantity: Number(row.quantity),
  stock: Number(row.stock || 0)
});

const normalizeCartItems = (items = []) => {
  const grouped = new Map();

  for (const item of items) {
    const productId = Number(item.product_id ?? item.id);
    const size = String(item.size || '').trim();
    const quantity = Number(item.quantity ?? 0);

    if (!productId || !size || quantity <= 0) continue;

    const key = `${productId}-${size}`;
    const current = grouped.get(key) || { product_id: productId, size, quantity: 0 };
    current.quantity += quantity;
    grouped.set(key, current);
  }

  return Array.from(grouped.values());
};

const ensureCart = async (conn, accountId) => {
  const [rows] = await conn.query('SELECT id FROM cart WHERE account_id = ?', [accountId]);
  if (rows[0]) return rows[0].id;

  const [result] = await conn.query(
    'INSERT INTO cart (account_id, created_at, updated_at) VALUES (?, NOW(), NOW())',
    [accountId]
  );
  return result.insertId;
};

const resolveProductSize = async (conn, productId, sizeName) => {
  const [rows] = await conn.query(
    `SELECT
       ps.id AS product_sizes_id,
       ps.stock,
       p.id AS product_id,
       p.name AS product_name,
       p.description,
       p.price AS original_price,
       p.discount_percent,
       p.image,
       s.size AS size_name
     FROM product_sizes ps
     INNER JOIN product p ON p.id = ps.product_id
     INNER JOIN sizes s ON s.id = ps.size_id
     WHERE ps.product_id = ? AND s.size = ?`,
    [productId, sizeName]
  );

  return rows[0] || null;
};

const getCartSnapshot = async (conn, accountId) => {
  const [rows] = await conn.query(
    `SELECT
       ci.id AS cart_item_id,
       ci.quantity,
       ci.product_sizes_id,
       ps.stock,
       ps.product_id,
       p.name AS product_name,
       p.description,
       p.price AS original_price,
       p.discount_percent,
       p.image,
       s.size AS size_name
     FROM cart c
    INNER JOIN cart_items ci ON ci.cart_id = c.id
     INNER JOIN product_sizes ps ON ps.id = ci.product_sizes_id
     INNER JOIN product p ON p.id = ps.product_id
     INNER JOIN sizes s ON s.id = ps.size_id
     WHERE c.account_id = ?
     ORDER BY ci.id ASC`,
    [accountId]
  );

  const items = rows.map((row) => ({
    ...mapCartRow(row),
    price: Number(row.original_price || 0) * (1 - Number(row.discount_percent || 0) / 100)
  }));

  const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const totalAmount = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

  return {
    items,
    totalQuantity,
    totalAmount
  };
};

const upsertResolvedItem = async (conn, accountId, productId, sizeName, quantity) => {
  const resolved = await resolveProductSize(conn, productId, sizeName);
  if (!resolved) {
    throw new Error(`Không tìm thấy size "${sizeName}" cho sản phẩm ${productId}`);
  }

  const safeQuantity = Math.max(1, Number(quantity || 1));
  const cartId = await ensureCart(conn, accountId);

  const [existingRows] = await conn.query(
    `SELECT ci.id, ci.quantity
     FROM cart_items ci
     WHERE ci.cart_id = ? AND ci.product_sizes_id = ?`,
    [cartId, resolved.product_sizes_id]
  );

  const currentQuantity = Number(existingRows[0]?.quantity || 0);
  const finalQuantity = Math.min(Number(resolved.stock || 0), currentQuantity + safeQuantity);

  if (finalQuantity <= 0) {
    return;
  }

  if (existingRows[0]) {
    await conn.query(
      'UPDATE cart_items SET quantity = ? WHERE id = ?',
      [finalQuantity, existingRows[0].id]
    );
    return;
  }

  await conn.query(
    'INSERT INTO cart_items (cart_id, product_sizes_id, quantity, created_at) VALUES (?, ?, ?, NOW())',
    [cartId, resolved.product_sizes_id, finalQuantity]
  );
};

export const getCartByAccountId = async (accountId) => {
  const conn = await db.getConnection();
  try {
    return await getCartSnapshot(conn, accountId);
  } finally {
    conn.release();
  }
};

export const syncCartItems = async (accountId, items = []) => {
  const normalizedItems = normalizeCartItems(items);
  const conn = await db.getConnection();
  
  let syncErrors = [];
  let successCount = 0;

  try {
    await conn.beginTransaction();

    // Xử lý từng item, ghi lại lỗi nhưng không dừng quá trình
    for (const item of normalizedItems) {
      try {
        await upsertResolvedItem(conn, accountId, item.product_id, item.size, item.quantity);
        successCount++;
      } catch (itemErr) {
        console.warn(`❌ Failed to sync item (product_id: ${item.product_id}, size: ${item.size}):`, itemErr.message);
        syncErrors.push({
          product_id: item.product_id,
          size: item.size,
          reason: itemErr.message
        });
      }
    }

    const snapshot = await getCartSnapshot(conn, accountId);
    
    // Nếu không có item nào được sync thành công và có lỗi, throw error
    if (successCount === 0 && syncErrors.length > 0) {
      await conn.rollback();
      const errorSummary = syncErrors.map(e => `${e.product_id}/${e.size}: ${e.reason}`).join('; ');
      throw new Error(`Không thể thêm bất kỳ sản phẩm nào vào giỏ. ${errorSummary}`);
    }

    // Nếu có một số item không sync được, vẫn commit nhưng log cảnh báo
    if (syncErrors.length > 0) {
      console.warn(`⚠️ Partial sync: ${successCount}/${normalizedItems.length} items synced`);
      console.warn(`Failed items:`, syncErrors);
    }

    await conn.commit();
    
    // Trả thêm metadata về sync result
    return {
      ...snapshot,
      _metadata: {
        syncedCount: successCount,
        failedCount: syncErrors.length,
        errors: syncErrors.length > 0 ? syncErrors : undefined
      }
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const addCartItem = async (accountId, { product_id, size, quantity = 1 }) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await upsertResolvedItem(conn, accountId, product_id, size, quantity);
    const snapshot = await getCartSnapshot(conn, accountId);
    await conn.commit();
    return snapshot;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const updateCartItem = async (accountId, { product_id, size, quantity }) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const resolved = await resolveProductSize(conn, product_id, size);
    if (!resolved) {
      throw new Error(`Không tìm thấy size "${size}" cho sản phẩm ${product_id}`);
    }

    const cartId = await ensureCart(conn, accountId);
    const finalQuantity = Math.min(Number(resolved.stock || 0), Math.max(0, Number(quantity || 0)));

    const [existingRows] = await conn.query(
      'SELECT id FROM cart_items WHERE cart_id = ? AND product_sizes_id = ?',
      [cartId, resolved.product_sizes_id]
    );

    if (!existingRows[0] || finalQuantity <= 0) {
      await conn.query('DELETE FROM cart_items WHERE cart_id = ? AND product_sizes_id = ?', [cartId, resolved.product_sizes_id]);
    } else {
      await conn.query(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [finalQuantity, existingRows[0].id]
      );
    }

    const snapshot = await getCartSnapshot(conn, accountId);
    await conn.commit();
    return snapshot;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const removeCartItem = async (accountId, { product_id, size }) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const resolved = await resolveProductSize(conn, product_id, size);
    if (!resolved) {
      throw new Error(`Không tìm thấy size "${size}" cho sản phẩm ${product_id}`);
    }

    const cartId = await ensureCart(conn, accountId);
    await conn.query('DELETE FROM cart_items WHERE cart_id = ? AND product_sizes_id = ?', [cartId, resolved.product_sizes_id]);

    const snapshot = await getCartSnapshot(conn, accountId);
    await conn.commit();
    return snapshot;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const clearCart = async (accountId) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const cartId = await ensureCart(conn, accountId);
    await conn.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
    const snapshot = await getCartSnapshot(conn, accountId);
    await conn.commit();
    return snapshot;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
