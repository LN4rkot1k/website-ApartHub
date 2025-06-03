const { addAdminToDB, 
    getAllComplexes, 
    insertComplex, 
    deleteComplexFromDB,
    getApartments,
    getApartmentByIdFromDB,
    updateApartmentInDB } = require('../database/dbOperations');

exports.getAddAdminPage = (req, res) => {
    const successMessage = req.session.successMessage;
    delete req.session.successMessage;

    res.render('addAdmin', {
        title: 'Добавление администратора',
        user: req.user,
        addAdminProfilePage: true,
        successMessage
    });
};

exports.addAdmin = async (req, res) => {
    const { login, password, name } = req.body;
    const phone_number = null;
    try {
        await addAdminToDB({ login, password, name, phone_number });
        req.session.successMessage = 'Администратор успешно добавлен!';
        res.redirect('/admin/add-admin');
    } catch (error) {
        console.error('Ошибка при добавлении администратора:', error);
        res.status(500).send('Ошибка сервера');
    }
};


exports.getAddComplexPage = async (req, res) => {
    try {
        const complexes = await getAllComplexes();
        const successMessage = req.session.successMessage;
        delete req.session.successMessage;

        res.render('addComplex', {
            title: 'Добавление жилого комплекса',
            user: req.user,
            successMessage,
            addComplexProfilePage: true,
            complexes
        });
    } catch(error) {
        console.error('Ошибка при загрузке страницы добавления комплекса:', error);
        res.status(500).send('Ошибка сервера');
    }
};

exports.addComplex = async (req, res) => {
    const { complex_title, complex_address, construction_year, house_type, housing_class } = req.body;
    const complex_imageurls = req.files.map(file => `/loadComplexPhotos/${file.filename}`);

    try {
        await insertComplex({
            complex_title, complex_address, construction_year,
            house_type, housing_class, complex_imageurls
        });

        req.session.successMessage = 'Жилой комплекс успешно добавлен';
        res.redirect('/admin/add-complex');
    } catch (error) {
        console.error('Ошибка при добавлении комплекса:', error);
        res.status(500).send('Ошибка сервера');
    }
};

exports.deleteComplex = async (req, res) => {
    const { complex_id } = req.body;

    try {
        await deleteComplexFromDB(complex_id);
        req.session.successMessage = "Жилой комплекс удален";
        res.redirect('/admin/add-complex');
    } catch (error) {
        console.error('Ошибка при удалении комплекса:', error);
        res.status(500).send('Ошибка сервера');
    }
};


exports.getModeratingPage = async (req, res) => {
    try {
        const apartments = await getApartments();
        const moderated = apartments.filter(a => a.status === true);
        const unmoderated = apartments.filter(a => a.status === false);
        res.render('admin/moderating-announcement', { moderated, unmoderated, getModeratingPage:true });
    } catch (error) {
        console.error('Ошибка при загрузке объявлений для модерации:', error);
        res.status(500).send('Ошибка сервера');
    }
};

exports.getApartmentByIdForAdmin = async (req, res) => {
    const { id } = req.params;
    try {
        const apartment = await getApartmentByIdFromDB(id);
        if (!apartment) return res.status(404).send('Объявление не найдено');
        res.render('admin/apartment-edit', { apartment, apartmentEdit: true });
    } catch (error) {
        console.error('Ошибка при получении квартиры:', error);
        res.status(500).send('Ошибка сервера');
    }
};

exports.updateApartmentByIdForAdmin = async (req, res) => {
    const { id } = req.params;
    const {
        address,
        floor,
        rooms,
        area,
        price,
        description,
        status
    } = req.body;

    const updatedApartment = {
        address,
        floor: parseInt(floor),
        rooms: parseInt(rooms),
        area: parseFloat(area),
        price: parseFloat(price),
        description,
        status: status === 'on' ? true : false
    };

    try {
        await updateApartmentInDB({
            apart_id: id,
            apart_address: address,
            apart_price: price,
            apart_rooms: rooms,
            apart_square: area,
            apart_description: description,
            apart_floor: floor,
            status: status === 'on' ? true : false
        });
        res.redirect('/admin/moderating-announcement');
    } catch (error) {
        console.error('Ошибка при обновлении квартиры:', error);
        res.status(500).send('Ошибка при сохранении данных');
    }
};

