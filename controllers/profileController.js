const { getAllComplexes } = require('../database/dbOperations');
const { insertApartment } = require('../database/dbOperations')
const { getApartmentsByUserId } = require('../database/dbOperations');
const { deleteApartmentByUser } = require('../database/dbOperations');
const { getApartmentById, updateApartment, findUserById,  } = require('../database/dbOperations');
const { updateUserWithPassword, updateUserWithoutPassword, findUserByLogin, deleteUserAndApartments } = require('../database/dbOperations');
const bcrypt = require('bcryptjs');


exports.getComplexes = async (req, res) => {
    try {
        const complexes = await getAllComplexes();
        res.json(complexes);
    } catch (error) {
        console.error('Ошибка при получении комплексов:', error);
        res.status(500).json({ error: 'Ошибка при получении комплексов' });
    }
};

exports.addApartment = async (req, res) => {
    try {
        console.log(req.user.user_id);

        const {
            address, price, rooms, area, description,
            floor, complex_id
        } = req.body;

        const userId = req.user.user_id;
        const status = false;

        const parsedComplexId = complex_id === '' ? null : Number(complex_id);

        const imagePaths = req.files.map(file => `/loadPhotos/${file.filename}`);

        await insertApartment({
            apart_address: address,
            apart_price: price,
            apart_rooms: rooms,
            apart_square: area,
            apart_description: description,
            apart_floor: floor,
            complex_id: parsedComplexId,
            user_id: userId,
            apart_imageurls: imagePaths,
            status
        });

        res.status(201).json({ message: 'Квартира добавлена' });
    } catch (error) {
        console.error('Ошибка при добавлении квартиры:', error);
        res.status(500).json({ error: 'Ошибка при добавлении квартиры' });
    }
};


exports.getUserApartments = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const apartments = await getApartmentsByUserId(userId);


    const formattedApartments = apartments.map(apt => ({
      apartment_id: apt.apart_id || apt.apartment_id,
      address: apt.apart_address || apt.address,
      rooms: apt.apart_rooms || apt.rooms,
      area: apt.apart_square || apt.area,
      price: apt.apart_price || apt.price,
    }));

    res.json(formattedApartments);
  } catch (error) {
    console.error('Ошибка при получении объявлений пользователя:', error);
    res.status(500).json({ error: 'Ошибка при получении объявлений пользователя' });
  }
};


exports.deleteApartment = async (req, res) => {
    const userId = req.user.user_id;
    const apartmentId = req.params.id;

    try {
        const result = await deleteApartmentByUser(apartmentId, userId);

        if (result.rowCount === 0) {
            return res.status(403).send('Нет прав для удаления или квартира не найдена');
        }

        res.status(200).send('Квартира удалена');
    } catch (error) {
        console.error('Ошибка при удалении квартиры:', error);
        res.status(500).send('Ошибка сервера при удалении квартиры');
    }
};


exports.getEditApartmentPage = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.user_id;

    try {
        const apartment = await getApartmentById(id);
        const complexes = await getAllComplexes();

        if (!apartment || apartment.user_id !== userId) {
            return res.status(403).send('Нет доступа к этой квартире');
        }

        res.render('editApartment', {
            apartment,
            complexes, showEditApartmentPage: true
        });
    } catch (error) {
        console.error('Ошибка при получении квартиры:', error);
        res.status(500).send('Ошибка при загрузке данных');
    }
};


exports.saveEditedApartment = async (req, res) => {
    const apartmentId = req.params.id;
    let {
        title, description, price, area, rooms,
        floor, complex_id, status, address
    } = req.body;

    complex_id = complex_id ? parseInt(complex_id, 10) : null;
    price = price ? parseFloat(price) : null;
    area = area ? parseFloat(area) : null;
    rooms = rooms ? parseInt(rooms, 10) : null;
    floor = floor ? parseInt(floor, 10) : null;
    status = status ? Boolean(status) : false;

    let image_urls;

    try {
        if (req.files && req.files.length > 0) {
            image_urls = req.files.map(file => `/loadPhotos/${file.filename}`);
        } else {
            const oldApartment = await getApartmentById(apartmentId);
            image_urls = oldApartment.apart_imageurls;
        }

        const apartmentData = {
            apart_address: address,
            apart_imageurls: image_urls,
            apart_price: price,
            apart_rooms: rooms,
            apart_square: area,
            apart_description: description,
            apart_floor: floor,
            complex_id,
            status
        };

        await updateApartment(apartmentId, apartmentData);

        res.send(`
            <script>
                alert("Квартира успешно обновлена!");
                window.location.href = "/userProfile";
            </script>
        `);
    } catch (err) {
        console.error('Ошибка при обновлении квартиры:', err);
        res.status(500).send('Ошибка при сохранении квартиры');
    }
};


exports.getEditProfilePage = async (req, res) => {
    const userId = req.user.user_id;
    try {
        const user = await findUserById(userId);
        res.render('edit-profile', { user, getEditProfilePage:true })
    } catch(error) {
        console.error('Ошибка при получении данных пользователя:', error);
        res.status(500).send('Ошибка сервера');
    }
};

exports.updateProfile = async (req, res) => {
    const userId = req.user.user_id;
    const { login, name, phone_number, password } = req.body;

    if (!login || !name || !phone_number) {
        return res.status(400).render('edit-profile', {
            error: 'Пожалуйста, заполните все обязательные поля.',
            user: { login, name, phone_number },
        });
    }

    try {
        const currentUser = await findUserById(userId);
        const existingUser = await findUserByLogin(login); 

        if (existingUser && existingUser.user_id !== currentUser.user_id) {
            return res.status(400).render('edit-profile', {
                alert: true,
                alertMessage: 'Этот логин уже занят другим пользователем.',
                user: { login, name, phone_number },
            });
        }

        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            await updateUserWithPassword(userId, login, hashedPassword, name, phone_number);
        } else {
            await updateUserWithoutPassword(userId, login, name, phone_number);
        }

        res.redirect('/userProfile');
    } catch (error) {
        console.error('Ошибка при обновлении профиля:', error);
        res.status(500).render('edit-profile', {
            alert: true,
            alertMessage: 'Ошибка при обновлении профиля. Попробуйте позже.',
            user: { login, name, phone_number },
        });
    }
};


exports.deleteProfile = async (req, res) => {
    const userId = req.user.user_id;

    try {
        await   (userId);
        req.logout(err => {
            if (err) {
                console.error('Ошибка при выходе:', err);
                return res.status(500).json({ message: 'Ошибка при выходе' });
            }
            res.status(200).json({ message: 'Профиль и квартиры успешно удалены' });
        });
    } catch (error) {
        console.error('Ошибка при удалении профиля:', error);
        res.status(500).json({ message: 'Ошибка сервера при удалении профиля' });
    }
};


exports.getPrivacyPolicy = (req, res) => {
    res.render('privacy-policy');
};

exports.getConsentPage = (req, res) => {
    res.render('consentPage');
};