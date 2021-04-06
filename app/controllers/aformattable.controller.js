const db = require("../models");
const RouteTable = db.aformattable;
const Distance = db.Distance;
const Op = db.Sequelize.Op;

// Create and Save a new Tutorial
exports.create = (req, res) => {

};
//Получить данные по направлению
exports.GetDetail = async (req, res) => {
    let dateStart = new Date();
    dateStart.setDate(dateStart.getDate() - 7);
    const
        {
            routeName,
            startDate = dateStart,
            stopDate =new Date(),
        } = req.query;
    let Deatail = await Promise.all((await RouteTable.findAll({
        attributes: [
            'id',
            'name',
            'mile',
            'route',
            'mid',
            'volume',
            [db.sequelize.fn('AVG', db.sequelize.col('volume')), 'avgVolume'],
            [db.sequelize.fn('AVG', db.sequelize.col('mid')), "avgPrice"],
        ],
        where: {
            name: routeName,
            datecreate:
                {
                    [Op.between]: [startDate, stopDate]
                },
        },
        include: [{
            model: Distance,
            as: 'Distances',
            attributes: ['distance'],
        }],
        group: ['name'],
    })))
    return res.status(200).json({Deatail});
}

//Получить полные данные по таблице с параметрами
exports.findAllAsync = async (req, res) => {
    console.log("True action await");
    const {
        page,
        order = "name",
        minMiles = 0,
        maxMiles = 10000,
        sortField = "name",
        sortType = "ASC",
        startDate,
        stopDate = new Date(),
    } = req.query;
    let TableData = await Promise.all((await RouteTable.findAll({
        offset: page * 11,
        limit: 11,
        where:
            {
                datecreate:
                    {
                        [Op.between]: [startDate, stopDate]
                    },

            },
        attributes: [
            'id',
            'name',
            'mile',
            'route',
            'mid',
            'volume',
            [db.sequelize.fn('AVG', db.sequelize.col('volume')), 'avgVolume'],
            [db.sequelize.fn('AVG', db.sequelize.col('mid')), "avgPrice"],
        ],
        include: [{// Notice `include` takes an ARRAY
            model: Distance,
            as: 'Distances',
            attributes: ['distance'],
            where: {
                distance:
                    {
                        [Op.between]: [minMiles, maxMiles]
                    }
            }
        }],
        group: ['name'],
        order: [[sortField, sortType]]
    })).map(async (it) => ({
        ...(it.toJSON()),
        addParams: await RouteTable.findAll(
            {
                attributes: [
                    [db.sequelize.fn('AVG', db.sequelize.col('mid')), "avgAllPrice"],
                    [db.sequelize.fn('AVG', db.sequelize.col('volume')), "avgAllVollume"],
                    //   [db.sequelize.literal('(100*(avg(aformattable.mid)-(SELECT avg(a.mid) FROM `aformattables` a where a.name = aformattable.name))/(SELECT avg(a.mid) FROM `aformattables` a where a.name = aformattable.name)) '),'PriceProcent'],
                    //  [db.sequelize.literal('(100*(avg(aformattable.volume)-(SELECT avg(a.volume) FROM `aformattables` a where a.name = aformattable.name)) /(SELECT avg(a.volume) FROM `aformattables` a where a.name = aformattable.name)) '),'VollumeProcent']
                ],
                where: {name: it.name}
            }
        )
    })));
    return res.status(200).json({TableData, total: await RouteTable.count()});
}


// Retrieve all Tutorials from the database.
exports.findAll = (req, res) => {
    console.log(req.query.route)
    const route = req.query.route;
    const offset = req.query.offset;
    let condition = route ? {
        route: {
            [Op.like]: `%${route}%`,
        }
    } : null;

    RouteTable.findAll({

        attributes: [
            //  db.sequelize.literal('(SELECT avg(a.mid) FROM `aformattables` a where a.name = aformattable.name) as avgAllPrice'),
            'name',
            'mile',
            'route',
            'mid',
            'volume',
            //(avg(tab.mid)/max(tab.mid))*100 as PriceProcent,
            [db.sequelize.fn('AVG', db.sequelize.col('mid')), "avgPrice"],
            [db.sequelize.fn('AVG', db.sequelize.col('volume')), 'avgVolume'],

        ],
        include: [{// Notice `include` takes an ARRAY
            model: Distance,
            as: 'Distances',
            attributes: ['distance'],
        }],
        group: ['name'],
        order: ['mid'],
        sort: ['mid', 'ASC'],
        limit: 11,
        offset: offset * 11,

    })
        .then(data => {
            for (let i = 0; i < data.length; i++) {
                data[i]['avgAllPrice'] = new Promise(resolve => {
                    const avgAllPrice = RouteTable.findOne(
                        {
                            attributes: [
                                [db.sequelize.fn('AVG', db.sequelize.col('mid')), "avgPrice"]
                            ],
                            where: {name: data[i].name}
                        }
                    )
                    return avgAllPrice;
                })
            }

            res.send(data);
        },)
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving tutorials."
            });
        });
};

// Find a single Tutorial with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    RouteTable.findByPk(id)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Tutorial with id=" + id
            });
        });
};

// Update a Tutorial by the id in the request
exports.update = (req, res) => {

};

// Delete a Tutorial with the specified id in the request
exports.delete = (req, res) => {

};

// Delete all Tutorials from the database.
exports.deleteAll = (req, res) => {

};

// Find all published Tutorials
exports.findAllPublished = (req, res) => {

};