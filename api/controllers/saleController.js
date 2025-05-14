import Sale from '../models/Sale.js'

// Get all sales
export const getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate({
        path: 'medicines.medicineId',
        model: 'Medicine',
      })
      .sort({ date: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single sale by ID
export const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate({
        path: 'medicines.medicineId',
        model: 'Medicine',
      });
    
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new sale
export const createSale = async (req, res) => {
  const { customerId, medicines, totalAmount } = req.body;

  if (!customerId || !medicines || !totalAmount) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newSale = new Sale({ customerId, medicines, totalAmount });
    await newSale.save();
    res.status(201).json(newSale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a sale
export const updateSale = async (req, res) => {
  try {
    const { customerId, medicines, totalAmount } = req.body;
    const updatedSale = await Sale.findByIdAndUpdate(
      req.params.id,
      { customerId, medicines, totalAmount },
      { new: true, runValidators: true }
    ).populate({
      path: 'medicines.medicineId',
      model: 'Medicine'
    });

    if (!updatedSale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    res.json(updatedSale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a sale
export const deleteSale = async (req, res) => {
  try {
    const deletedSale = await Sale.findByIdAndDelete(req.params.id);
    
    if (!deletedSale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
