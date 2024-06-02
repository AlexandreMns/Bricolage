const Alert = require('../models/alert');

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
    getAllAlerts,
    deleteAlert,
};