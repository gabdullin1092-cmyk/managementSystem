"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Company_1 = __importDefault(require("../models/Company"));
const index_1 = require("../types/index");
const router = express_1.default.Router();
// GET /api/companies - Получить список компаний с фильтрацией и пагинацией
router.get('/', async (req, res) => {
    try {
        const filters = {
            name: req.query.name,
            idn: req.query.idn,
            status: req.query.status
                ? parseInt(req.query.status)
                : undefined,
        };
        const pagination = {
            page: parseInt(req.query.page || '1'),
            limit: parseInt(req.query.limit || '10'),
        };
        const result = await Company_1.default.getAll(filters, pagination);
        res.json({
            success: true,
            message: 'Компании успешно получены',
            data: result,
        });
    }
    catch (error) {
        console.error('Ошибка при получении компаний:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении компаний',
            error: error instanceof Error ? error.message : 'Неизвестная ошибка',
        });
    }
});
// GET /api/companies/stats - Получить статистику по компаниям
router.get('/stats', async (req, res) => {
    try {
        const stats = await Company_1.default.getStats();
        res.json({
            success: true,
            message: 'Статистика успешно получена',
            data: stats,
        });
    }
    catch (error) {
        console.error('Ошибка при получении статистики:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении статистики',
            error: error instanceof Error ? error.message : 'Неизвестная ошибка',
        });
    }
});
// GET /api/companies/:id - Получить компанию по ID
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id || '0');
        if (isNaN(id)) {
            res.status(400).json({
                success: false,
                message: 'Некорректный ID компании',
            });
            return;
        }
        const company = await Company_1.default.getById(id);
        if (!company) {
            res.status(404).json({
                success: false,
                message: `Компания с ID ${id} не найдена`,
            });
            return;
        }
        res.json({
            success: true,
            message: 'Компания успешно получена',
            data: company,
        });
    }
    catch (error) {
        console.error('Ошибка при получении компании:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении компании',
            error: error instanceof Error ? error.message : 'Неизвестная ошибка',
        });
    }
});
// POST /api/companies - Создать новую компанию
router.post('/', async (req, res) => {
    try {
        const companyData = req.body;
        // Валидация обязательных полей
        if (!companyData.name || !companyData.idn) {
            res.status(400).json({
                success: false,
                message: 'Поля name и idn обязательны для заполнения',
            });
            return;
        }
        // Валидация статуса
        if (companyData.status &&
            companyData.status !== index_1.CompanyStatus.ACTIVE &&
            companyData.status !== index_1.CompanyStatus.INACTIVE) {
            res.status(400).json({
                success: false,
                message: 'Статус должен быть 10 или 20',
            });
            return;
        }
        const newCompany = await Company_1.default.create(companyData);
        res.status(201).json({
            success: true,
            message: 'Компания успешно создана',
            data: newCompany,
        });
    }
    catch (error) {
        console.error('Ошибка при создании компании:', error);
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : 'Ошибка при создании компании',
        });
    }
});
// PUT /api/companies/:id - Обновить компанию
router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id || '0');
        if (isNaN(id)) {
            res.status(400).json({
                success: false,
                message: 'Некорректный ID компании',
            });
            return;
        }
        const updateData = req.body;
        // Валидация статуса если он передан
        if (updateData.status !== undefined &&
            updateData.status !== index_1.CompanyStatus.ACTIVE &&
            updateData.status !== index_1.CompanyStatus.INACTIVE) {
            res.status(400).json({
                success: false,
                message: 'Статус должен быть 10 или 20',
            });
            return;
        }
        const updatedCompany = await Company_1.default.update(id, updateData);
        if (!updatedCompany) {
            res.status(404).json({
                success: false,
                message: `Компания с ID ${id} не найдена`,
            });
            return;
        }
        res.json({
            success: true,
            message: 'Компания успешно обновлена',
            data: updatedCompany,
        });
    }
    catch (error) {
        console.error('Ошибка при обновлении компании:', error);
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : 'Ошибка при обновлении компании',
        });
    }
});
// DELETE /api/companies/:id - Удалить компанию
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id || '0');
        if (isNaN(id)) {
            res.status(400).json({
                success: false,
                message: 'Некорректный ID компании',
            });
            return;
        }
        const deleted = await Company_1.default.delete(id);
        if (!deleted) {
            res.status(404).json({
                success: false,
                message: `Компания с ID ${id} не найдена`,
            });
            return;
        }
        res.json({
            success: true,
            message: 'Компания успешно удалена',
        });
    }
    catch (error) {
        console.error('Ошибка при удалении компании:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при удалении компании',
            error: error instanceof Error ? error.message : 'Неизвестная ошибка',
        });
    }
});
// POST /api/companies/:id/employees - Добавить сотрудника в компанию
router.post('/:id/employees', async (req, res) => {
    try {
        const id = parseInt(req.params.id || '0');
        if (isNaN(id)) {
            res.status(400).json({
                success: false,
                message: 'Некорректный ID компании',
            });
            return;
        }
        const { userId, userName } = req.body;
        if (!userId || !userName) {
            res.status(400).json({
                success: false,
                message: 'Поля userId и userName обязательны',
            });
            return;
        }
        const updatedCompany = await Company_1.default.addEmployee(id, userId, userName);
        if (!updatedCompany) {
            res.status(404).json({
                success: false,
                message: `Компания с ID ${id} не найдена`,
            });
            return;
        }
        res.json({
            success: true,
            message: 'Сотрудник успешно добавлен',
            data: updatedCompany,
        });
    }
    catch (error) {
        console.error('Ошибка при добавлении сотрудника:', error);
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : 'Ошибка при добавлении сотрудника',
        });
    }
});
// DELETE /api/companies/:id/employees/:userId - Удалить сотрудника из компании
router.delete('/:id/employees/:userId', async (req, res) => {
    try {
        const id = parseInt(req.params.id || '0');
        const userId = parseInt(req.params.userId || '0');
        if (isNaN(id) || isNaN(userId)) {
            res.status(400).json({
                success: false,
                message: 'Некорректный ID компании или сотрудника',
            });
            return;
        }
        const updatedCompany = await Company_1.default.removeEmployee(id, userId);
        if (!updatedCompany) {
            res.status(404).json({
                success: false,
                message: `Компания с ID ${id} не найдена`,
            });
            return;
        }
        res.json({
            success: true,
            message: 'Сотрудник успешно удален',
            data: updatedCompany,
        });
    }
    catch (error) {
        console.error('Ошибка при удалении сотрудника:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при удалении сотрудника',
            error: error instanceof Error ? error.message : 'Неизвестная ошибка',
        });
    }
});
exports.default = router;
//# sourceMappingURL=companies.js.map