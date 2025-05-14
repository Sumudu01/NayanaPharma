import Item from '../models/item.model.js'

export const getProductCount = async (req, res, next) => {
  try {
    const count = await Item.countDocuments().exec()
    return res.status(200).json({ count })
  } catch (error) {
    next(error)
  }
}

export const getStockCount = async (req, res, next) => {
  try {
    const items = await Item.find().exec()
    const count = items.reduce((acc, order) => acc + Number(order.stock_quentity || 0), 0)
    return res.status(200).json({ count })
  } catch (error) {
    next(error)
  }
}

// Update stock quantity
export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, soldQuantity } = req.body;

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Update stock and sold quantities
    item.stock_quentity += quantity;
    item.sold_quentity += soldQuantity;

    // Validate stock quantity
    if (item.stock_quentity < 0) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    await item.save();
    res.json(item);
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ message: 'Error updating stock' });
  }
};
