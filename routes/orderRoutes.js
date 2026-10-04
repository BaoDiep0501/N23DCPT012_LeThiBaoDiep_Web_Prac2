const express = require('express');
const router = express.Router();
const Order = require('../models/Order');


// 1. Lay toan bo don hang
// GET /api/orders
// GET /api/orders?status=pending
// GET /api/orders?sort=asc
router.get('/', async (req, res) => {
    try {
        const filter = {};

        // Loc theo trang thai
        if (req.query.status) {
            filter.status = req.query.status;
        }

        let query = Order.find(filter);

        // Sap xep theo tong tien
        if (req.query.sort) {
            const sortOrder = req.query.sort;

            query = query.sort({
                totalAmount: sortOrder === 'asc' ? 1 : -1
            });
        }

        const orders = await query;

        res.status(200).json({
            success: true,
            data: orders,
            message: 'Lay danh sach don hang thanh cong'
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            data: null,
            message: err.message
        });
    }
});


// 2. Tim kiem theo ten khach hang
// GET /api/orders/search?name=Nguyen
router.get('/search', async (req, res) => {
    try {
        const name = req.query.name;

        const orders = await Order.find({
            customerName: {
                $regex: name,
                $options: 'i'
            }
        });

        res.status(200).json({
            success: true,
            data: orders,
            message: 'Tim kiem don hang thanh cong'
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            data: null,
            message: err.message
        });
    }
});


// 3. Lay don hang theo ID
// GET /api/orders/:id
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                data: null,
                message: 'Khong tim thay don hang'
            });
        }

        res.status(200).json({
            success: true,
            data: order,
            message: 'Lay don hang thanh cong'
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            data: null,
            message: err.message
        });
    }
});


// 4. Tao don hang moi
// POST /api/orders
router.post('/', async (req, res) => {
    try {
        const calculatedTotal = req.body.items.reduce((sum, item) => {
            return sum + item.quantity * item.unitPrice;
        }, 0);

        if (calculatedTotal !== req.body.totalAmount) {
            return res.status(400).json({
                success: false,
                data: null,
                message: 'totalAmount khong khop voi tong gia tri cac san pham'
            });
        }

        const order = new Order({
            customerName: req.body.customerName,
            customerEmail: req.body.customerEmail,
            items: req.body.items,
            totalAmount: req.body.totalAmount
        });

        const newOrder = await order.save();

        res.status(201).json({
            success: true,
            data: newOrder,
            message: 'Tao don hang thanh cong'
        });

    } catch (err) {
        res.status(400).json({
            success: false,
            data: null,
            message: err.message
        });
    }
});


// 5. Cap nhat don hang
// PUT /api/orders/:id
router.put('/:id', async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedOrder) {
            return res.status(404).json({
                success: false,
                data: null,
                message: 'Khong tim thay don hang'
            });
        }

        res.status(200).json({
            success: true,
            data: updatedOrder,
            message: 'Cap nhat don hang thanh cong'
        });

    } catch (err) {
        res.status(400).json({
            success: false,
            data: null,
            message: err.message
        });
    }
});


// 6. Xoa don hang
// DELETE /api/orders/:id
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Order.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                data: null,
                message: 'Khong tim thay don hang'
            });
        }

        res.status(200).json({
            success: true,
            data: deleted,
            message: 'Da xoa don hang thanh cong'
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            data: null,
            message: err.message
        });
    }
});


module.exports = router;