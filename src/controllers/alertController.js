const Alert = require('../models/alert');
const Stock = require('../models/stock');
const Product = require('../models/produto');
const { createAlert } = require('../service/alertConfig');

/*
const manageAlert = async (req, res ,next ) => {
    try {
        const productId = req.params.productId;
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Produto não encontrado');
        }
        createAlert(productId);
        res.status(200).send('Alerta gerenciado com sucesso');
    } catch (error) {
        console.error('Erro ao gerenciar o alerta:', error);
    }
}*/

const getAllAlerts = async (req, res, next) => {
    try {
        const alerts = await Alert.find();
        const AllAlerts = alerts.map((alert) => {
            return {
                product: alert.product,
                quantity: alert.quantity,
                message: alert.message,
                status: alert.status,
            };
        });
        res.status(200).json(AllAlerts);
    } catch (error) {
        console.error('Erro ao buscar os alertas:', error);
    }
}

const deleteAlert = async (req, res, next) => {
    try {
        const productId = req.params.id;
        console.log('Produto ID:', productId);
        const alert = await Alert.findOneAndDelete({ product: productId });
        if (!alert) {
            throw new Error('Alerta não encontrado');

        }
        res.status(204).send('Alerta deletado com sucesso');
    } catch (error) {
        console.error('Erro ao deletar o alerta:', error);
        res.status(500).send('Erro ao deletar o alerta');
    }
}


module.exports = {
    //manageAlert,
    getAllAlerts,
    deleteAlert,
};