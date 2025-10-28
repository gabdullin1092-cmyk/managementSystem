const express = require('express');
const User = require('../models/User');
const router = express.Router();

// GET /api/users - Получить всех пользователей с пагинацией и фильтрацией
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const filters = {};

        // Собираем фильтры из query параметров
        if (req.query.city) filters.city = req.query.city;
        if (req.query.status) filters.status = parseInt(req.query.status);
        if (req.query.name) filters.name = req.query.name;

        const result = await User.getAll(page, limit, filters);
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// GET /api/users/stats - Получить статистику пользователей
router.get('/stats', async (req, res) => {
    try {
        const stats = await User.getStatistics();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// GET /api/users/:id - Получить пользователя по ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.getById(req.params.id);
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        const statusCode = error.message.includes('не найден') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
});

// POST /api/users - Создать нового пользователя
router.post('/', async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Пользователь успешно создан',
            data: user
        });
    } catch (error) {
        const statusCode = error.message.includes('обязательно') || 
                          error.message.includes('должен быть') ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
});

// PUT /api/users/:id - Обновить пользователя
router.put('/:id', async (req, res) => {
    try {
        const user = await User.update(req.params.id, req.body);
        res.json({
            success: true,
            message: 'Пользователь успешно обновлен',
            data: user
        });
    } catch (error) {
        let statusCode = 500;
        if (error.message.includes('не найден')) statusCode = 404;
        if (error.message.includes('должен быть')) statusCode = 400;
        
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
});

// DELETE /api/users/:id - Удалить пользователя
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.delete(req.params.id);
        res.json({
            success: true,
            message: 'Пользователь успешно удален',
            data: user
        });
    } catch (error) {
        const statusCode = error.message.includes('не найден') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;