const Alert = require('../models/alert');
const Stock = require('../models/stock');
const Product = require('../models/produto');

const createAlert = async (productId) => {
    try {
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Produto não encontrado');
        }

        const stock = await Stock.findOne({ product: productId });
        let status = 'active';
        let message = `Estoque baixo: ${stock.quantity}`;

        const alert = await Alert.findOneAndUpdate(
            { product: productId },
            { 
                product: productId,
                quantity: stock.quantity,
                message,
                status,
            },
            { upsert: true, new: true }
        );

        console.log('Alerta gerenciado com sucesso:', alert);
    } catch (error) {
        console.error('Erro ao gerenciar o alerta:', error);
    }
}

module.exports = {
    createAlert,
};

