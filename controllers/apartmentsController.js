const dbOperations = require('../database/dbOperations');

exports.showApartmentsPage = async (req, res) => {
    try {
        const complexId = req.query.complex_id;
        let complex = null;
        let apartments = await dbOperations.getAllApartments();
        let complexes = await dbOperations.getAllComplexes();   

        let mapCoordinates = null;
        let staticMapUrl = null;

        const getStaticMapUrl = (latitude, longitude) => {
            return `https://static-maps.yandex.ru/1.x/?ll=${longitude},${latitude}&z=16&size=450,450&l=map&pt=${longitude},${latitude},pm2rdm`;
        }

        if (complexId) {
            complex = await dbOperations.getComplexById(complexId);
            apartments = apartments.filter(apartment => apartment.complex_id == complexId);

            if (complex && complex.complex_address) {
                try {
                    
                    mapCoordinates = await dbOperations.getCoordinatesFromYandex(complex.complex_address);

                    if (mapCoordinates) {
                        staticMapUrl = getStaticMapUrl(mapCoordinates.latitude, mapCoordinates.longitude);
                    }

                } catch (error) {
                    console.error('Ошибка получения координат комплекса:', error.message);
                }
            }
        }

        res.render('apartments', { 
            complex, 
            apartments, 
            complexes, 
            apartmentsPage: true,
            mapCoordinates,
            staticMapUrl
        });

    } catch (error) {
        console.error("Ошибка при получении данных", error);
        res.status(500).send("Ошибка при загрузке страницы");
    }
};

exports.showApartmentDetails = async (req, res) => {
    try {
        const apartmentId = req.params.id;
        const apartment = await dbOperations.getApartmentById(apartmentId);

        if (!apartment) {
            return res.status(404).send('Квартира не найдена');
        }

        const complex = await dbOperations.getComplexById(apartment.complex_id);

        let mapCoordinates = null;
        if (apartment.apart_address) {
            try {
                mapCoordinates = await dbOperations.getCoordinatesFromYandex(apartment.apart_address);
            } catch (error) {
                console.error('Ошибка получения координат квартиры:', error.message);
            }
        }

        res.render('apartmentDetails', { 
            apartment, 
            complex, 
            apartmentDetailPage: true,
            mapCoordinates
        });

    } catch (error) {
        console.error('Ошибка при загрузке страницы квартиры:', error);
        res.status(500).send('Ошибка сервера');
    }
};

exports.filterApartments = async (req, res) => {
    try {
        const {
            complex,
            priceMin,
            priceMax,
            rooms,
            areaMin,
            areaMax,
            floorMin,
            floorMax
        } = req.query;

        let apartments = await dbOperations.getAllApartments();

        // Фильтрация
        apartments = apartments.filter(apart => {
            if (complex && complex !== 'all') {
                if (complex === 'none' && apart.complex_id !== null) return false;
                if (complex !== 'none' && apart.complex_id != complex) return false;
            }

            // Цена
            if (priceMin && apart.apart_price < parseInt(priceMin)) return false;
            if (priceMax && apart.apart_price > parseInt(priceMax)) return false;

            // Комнаты
            if (rooms) {
                const numRooms = parseInt(rooms);
                if (numRooms === 4 && parseInt(apart.apart_rooms) < 4) return false;
                if (numRooms !== 4 && parseInt(apart.apart_rooms) !== numRooms) return false;
            }

            // Площадь
            if (areaMin && apart.apart_square < parseFloat(areaMin)) return false;
            if (areaMax && apart.apart_square > parseFloat(areaMax)) return false;

            // Этаж
            if (floorMin && apart.apart_floor < parseInt(floorMin)) return false;
            if (floorMax && apart.apart_floor > parseInt(floorMax)) return false;

            return true;
        });

        res.json(apartments);
    } catch (err) {
        console.error("Ошибка фильтрации квартир:", err);
        res.status(500).json({ error: 'Ошибка сервера при фильтрации' });
    }
};
