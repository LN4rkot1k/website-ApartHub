const pool = require('./database');
const bcrypt = require('bcryptjs');
const fetch = require('node-fetch');
const YANDEX_API_KEY = '26c8748e-306f-4c2c-8b89-8f84443a552d';

async function findUserByLogin(login) {
    try {
        const { rows } = await pool.query('SELECT * FROM users WHERE login = $1', [login]);
        return rows[0];
    } catch(error) {
        console.error("Ошибка при поиске пользователя по login:", error);
        throw error;
    }
};

async function findUserById(id) {
    try {
        const { rows } = await pool.query('SELECT * FROM users WHERE user_id = $1', [id]);
        return rows[0];
    } catch(error) {
        console.error("Ошибка при поиске пользователя по id:", error);
        throw error;
    }
};

async function createUser({ login, password, name = null, phone_number = null, role }) {
    try {
        const { rows } = await pool.query(
            `INSERT INTO users (login, password, name, phone_number, role)
            VALUES ($1, $2, $3, $4, $5) RETURNING * 
            `, [login, password, name, phone_number, role]
        );
        return rows[0];
    } catch(error) {
        console.error("Ошибка при создании пользователя:", error);
        throw error;
    }
};

const getAllApartments = async () => {
    try {
        const result = await pool.query('SELECT * FROM apartments WHERE status = true');
        return result.rows;
    } catch (error) {
        console.error('Ошибка при получении данных', error);
        throw error;
    }
};

const getApartments = async () => {
    try {
        const result = await pool.query('SELECT * FROM apartments');
        return result.rows;
    } catch (error) {
        console.error('Ошибка при получении данных', error);
        throw error;
    }
};

const getAllComplexes = async () => {
    try {
        const result = await pool.query(`SELECT * FROM complexes`);
        return result.rows;
    } catch (error) {
        console.error("Ошибка при получении данных о комплексах", error);
        throw error;
    }
}

const getComplexById = async (complexId) => {
    try {
        const query = `SELECT * FROM complexes WHERE complex_id = $1`;
        const { rows } = await pool.query(query, [complexId]);
        return rows.length ? rows[0] : null;
    } catch (error) {
        console.error("Ошибка при получении жилого комплекса:", error);
        throw error;
    }
};

const getApartmentById = async (apart_id) => {
    const result = await pool.query('SELECT * FROM apartments WHERE apart_id = $1', [apart_id]);
    return result.rows[0];
}

//Функция получения координат комплекса и квартир
async function getCoordinatesFromYandex(address) {
    const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_API_KEY}&geocode=${encodeURIComponent(address)}&format=json`;

    const response = await fetch(url);
    const data = await response.json();

    try {
        const pos = data.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos;
        const [longitude, latitude] = pos.split(' ').map(Number);

        return { latitude, longitude };
    } catch (error) {
        console.error('Не удалось получить координаты:', error);
        return null;
    }
}

async function insertApartment(apartmentData) {
    const {
        apart_address,
        apart_price,
        apart_rooms,
        apart_square,
        apart_description,
        apart_floor,
        complex_id,
        user_id,
        apart_imageurls,
        status
    } = apartmentData;

    const query = `
        INSERT INTO apartments (
            apart_address,
            apart_price,
            apart_rooms,
            apart_square,
            apart_description,
            apart_floor,
            complex_id,
            user_id,
            apart_imageurls,
            status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;

    const values = [
        apart_address,
        apart_price,
        apart_rooms,
        apart_square,
        apart_description,
        apart_floor,
        complex_id,
        user_id,
        apart_imageurls,
        status
    ];

    try {
        await pool.query(query, values);
    } catch (error) {
        console.error('Ошибка при вставке квартиры:', error);
        throw error;
    }
};


async function addAdminToDB({ login, password, name, phone_number }) {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `insert into users (login, password, name, phone_number, role)
            values ($1, $2, $3, $4, $5)`,
            [login, hashedPassword, name, phone_number, 'admin']
        );
        return result;
    } catch (error) {
        console.error('Ошибка при добавлении администратора:', error);
        throw error;
    }
};


async function insertComplex({ complex_title, complex_address, construction_year,
    house_type, housing_class,complex_imageurls }) {
        try {
            const result = await pool.query(
                `insert into complexes 
                (complex_title, complex_address, construction_year, house_type, housing_class, complex_imageurls)
                values ($1, $2, $3, $4, $5, $6)`,
                [complex_title, complex_address, construction_year, house_type, housing_class, complex_imageurls]
            );
            return result;
        } catch (error) {
            console.error('Ошибка при добавлении комплекса в БД:', error);
            throw error;
        }
};

async function deleteComplexFromDB(complex_id) {
    try {
        await pool.query(`delete from complexes where complex_id = $1`, [complex_id]);
    } catch(error) {
        console.error('Ошибка при удалении комплекса:', error);
        throw error;
    }
};

async function getApartmentByIdFromDB(id) {
    const { rows } = await pool.query(`SELECT * FROM apartments WHERE apart_id = $1`, [id]);
    return rows[0];
};

async function updateApartmentInDB(data) {
    const {
        apart_id,
        apart_address,
        apart_price,
        apart_rooms,
        apart_square,
        apart_description,
        apart_floor,
        status
    } = data;

    await pool.query(
        `UPDATE apartments SET
            apart_address = $1,
            apart_price = $2,
            apart_rooms = $3,
            apart_square = $4,
            apart_description = $5,
            apart_floor = $6,
            status = $7
        WHERE apart_id = $8`,
        [
            apart_address,
            apart_price,
            apart_rooms,
            apart_square,
            apart_description,
            apart_floor,
            status,
            apart_id
        ]
    );
}

async function getApartmentsByUserId(userId) {
  const query = `
    SELECT apart_id, apart_address, apart_rooms, apart_square, apart_price
    FROM apartments
    WHERE user_id = $1
    ORDER BY apart_id DESC
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows;
}

async function deleteApartmentByUser(apartmentId, userId)  {
        const query = `
        DELETE FROM apartments 
        WHERE apart_id = $1 AND user_id = $2
    `;
    const values = [apartmentId, userId];

    return await pool.query(query, values);
};

async function getApartmentByIdAndUser(apartmentId, userId) {
    const query = 'SELECT * FROM apartments WHERE apart_id = $1 AND user_id = $2';
    const values = [apartmentId, userId];
    const result = await pool.query(query, values);
    return result.rows[0];
}


async function updateApartment(apartId, data) {
    const {
        apart_address,
        apart_imageurls,
        apart_price,
        apart_rooms,
        apart_square,
        apart_description,
        apart_floor,
        complex_id,
        status
    } = data;

    const query = `
        UPDATE apartments SET
            apart_address = $1,
            apart_imageurls = $2,
            apart_price = $3,
            apart_rooms = $4,
            apart_square = $5,
            apart_description = $6,
            apart_floor = $7,
            complex_id = $8,
            status = $9
        WHERE apart_id = $10
    `;

    const values = [
        apart_address,
        apart_imageurls,
        apart_price,
        apart_rooms,
        apart_square,
        apart_description,
        apart_floor,
        complex_id,
        status,
        apartId
    ];

    await pool.query(query, values);
}

async function getContactInfoByApartmentId(userId) {
    const query = `
        SELECT name, phone_number
        FROM users
        WHERE user_id = $1
    `;
    const values = [userId];
    const result = await pool.query(query, values);
    return result.rows[0];
}

async function updateUserWithPassword(id, login, hashedPassword, name, phone) {
    const query = `
        UPDATE users
        SET login = $1, password = $2, name = $3, phone_number = $4
        WHERE user_id = $5
    `;
    await pool.query(query, [login, hashedPassword, name, phone, id]);
}

async function updateUserWithoutPassword(id, login, name, phone) {
    const query = `
        UPDATE users
        SET login = $1, name = $2, phone_number = $3
        WHERE user_id = $4
    `;
    await pool.query(query, [login, name, phone, id]);
}


async function deleteUserAndApartments(userId) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query("DELETE FROM apartments WHERE user_id = $1", [userId]);
        await client.query("DELETE FROM users WHERE user_id = $1", [userId]);
        await client.query("COMMIT");
    } catch(error) {
        await client.query("ROOLBACK");
        console.error('Ошибка при удалении пользователя и его квартир:', error);
        throw error;

    } finally {
        client.release();
    }
};

module.exports = {
    getApartments,updateUserWithPassword, updateUserWithoutPassword, deleteUserAndApartments,
    getAllApartments,getAllComplexes, getComplexById,createUser, findUserByLogin,
    findUserById, getApartmentById, getCoordinatesFromYandex, insertApartment,
    addAdminToDB, insertComplex, deleteComplexFromDB,getApartmentByIdFromDB,
    updateApartmentInDB, getApartmentsByUserId, deleteApartmentByUser,
    getApartmentByIdAndUser, updateApartment, getContactInfoByApartmentId
};