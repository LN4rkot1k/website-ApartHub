const dbOperations = require('../database/dbOperations');

exports.showMainPage = async (req, res) => {
    try {
        const apartments = await dbOperations.getAllApartments();
        const complexes = await dbOperations.getAllComplexes();

        console.log(apartments);
        console.log(complexes);

        res.render('home', { apartments: apartments, complexes: complexes });
    } catch (error) {
        console.error("Ошибка при получении данных", error);
        res.status(500).send('Ошибка при получении данных');
    }
};

exports.showCalculatorPage = async (req, res) => {
    res.render('mortgage-calculator', {mortgageCalculatorPage: true});
};

exports.getContactByApartmentId = async (req, res) => {
    const apartmentId = req.params.id;

    try {
        const contact = await dbOperations.getContactInfoByApartmentId(apartmentId);
        if (contact) {
            res.json(contact);
        } else {
            res.status(404).json({ error: 'Контакт не найден' });
        }
    } catch (error) {
        console.error('Ошибка при получении контакта:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};

