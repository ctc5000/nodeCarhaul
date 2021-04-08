const db = require("../models");
const RouteTable = db.aformattable;
const Distance = db.Distance;
const Trends = db.Trends;
const Op = db.Sequelize.Op;

// Create and Save a new Tutorial
exports.create = (req, res) => {

};

exports.findAllTrendsAsync = async (req, res) => {
    console.log("True action findAllTrendsAsync");
    const
        {
            namestate
        } = req.query;
    let TrendsReturn = await Promise.all((await Trends.findAll({
        attributes:
            [
                'value',
            ],
        where: {
            namestate: [namestate],
            intervaldate:30,
        }
    })));

    return res.status(200).json({
        TrendsReturn
    });
}


//Получить данные по направлению
exports.GetDetail = async (req, res) => {
    let dateStart = new Date();
    dateStart.setDate(dateStart.getDate() - 7);
    const
        {
            routeName,
            startDate = dateStart,
            stopDate = new Date(),
        } = req.query;

    let GraphPoints = await Promise.all((await RouteTable.findAll({
        attributes: [
            ['mid', 'price'],
            'volume',
            'datecreate',
        ],
        where: {
            name: routeName,
            datecreate:
                {
                    [Op.between]: [startDate, stopDate]
                },
        },
        group: ['datecreate'],
    })));


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

    })).map(async (it) => ({
            ...(it.toJSON()),
            trend1:
                await Trends.findOne({
                    attributes:
                        [
                            'value',
                        ],
                    where: {
                        namestate:  it.name.substring(0,2),
                        intervaldate:30,
                    }
                }),
            trend2:
                await Trends.findOne({
                    attributes:
                        [
                            'value',
                        ],
                    where: {
                        namestate:  it.name.substring(2,4),
                        intervaldate:30,
                    }
                }),


        }))



    )
    return res.status(200).json({Deatail, GraphPoints: GraphPoints});
}

//Получить полные данные по таблице с параметрами
exports.findAllAsync = async (req, res) => {
    console.log("True action findAllAsync");
    let dateStart = new Date();
    dateStart.setDate(dateStart.getDate() - 7);
    let {
        page,
        order = "name",
        minMiles = 0,
        maxMiles = 10000,
        sortField = "name",
        sortType = "ASC",
        startDate = dateStart,
        stopDate = new Date(),
    } = req.query;


    order = [[sortField, sortType]];

    if (sortField === "avgPrice") order = [[db.sequelize.fn('AVG', db.sequelize.col('mid')), sortType]];
    if (sortField === "avgVolume") order = [[db.sequelize.fn('AVG', db.sequelize.col('volume')), sortType]];
    let TableData = await Promise.all((await RouteTable.findAll({
        offset: page * 11,
        limit: 11,
        where: {
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
        order: order
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
        ),
        route: it.route.split(','),
        pm: it.mid / it.mile,
        trend1:
            await Trends.findOne({
                attributes:
                    [
                        'value',
                    ],
                where: {
                    namestate:  it.name.substring(0,2),
                    intervaldate:30,
                }
            }),
        trend2:
            await Trends.findOne({
                attributes:
                    [
                        'value',
                    ],
                where: {
                    namestate:  it.name.substring(2,4),
                    intervaldate:30,
                }
            }),


    })));

    let counter = await Promise.all((

        await RouteTable.count(
            {
                where: {
                    datecreate:
                        {
                            [Op.between]: [startDate, stopDate]
                        },
                }
                , group: ['name']
            }
        )

    ));

    return res.status(200).json({
        TableData, totalOne: counter.length, totalPages: Math.floor(counter.length / 11) + 1, curPage: page
    });
}
//Получить полные данные по таблице с параметрами и фильтром
exports.findAllAsyncFiltered = async (req, res) => {
    console.log("True action findAllAsyncFiltered");
    let dateStart = new Date();
    dateStart.setDate(dateStart.getDate() - 7);
    let {
        page,
        order = "name",
        minMiles = 0,
        maxMiles = 10000,
        sortField = "name",
        sortType = "ASC",
        startDate = dateStart,
        stopDate = new Date(),
        states = ["ALAR"]
    } = req.query;
    if (states.length === 1) {
        return res.status(500).json('null parse data');
    }

    let statesJson = JSON.parse(states);


    order = [[sortField, sortType]];
    if (sortField === "avgPrice") order = [[db.sequelize.fn('AVG', db.sequelize.col('mid')), sortType]];
    if (sortField === "avgVolume") order = [[db.sequelize.fn('AVG', db.sequelize.col('volume')), sortType]];
    let TableData = await Promise.all((await RouteTable.findAll({
        offset: page * 11,
        limit: 11,
        where: {
            datecreate:
                {
                    [Op.between]: [startDate, stopDate]
                },
            name:
                {
                    [Op.in]: statesJson
                }

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
        order: order
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
        ),
        route: it.route.split(','),
        pm: it.mid / it.mile,
        trend1:
            await Trends.findOne({
                attributes:
                    [
                        'value',
                    ],
                where: {
                    namestate:  it.name.substring(0,2),
                    intervaldate:30,
                }
            }),
        trend2:
            await Trends.findOne({
                attributes:
                    [
                        'value',
                    ],
                where: {
                    namestate:  it.name.substring(2,4),
                    intervaldate:30,
                }
            }),
    })));

    let counter = await Promise.all((

        await RouteTable.count(
            {
                where: {
                    datecreate:
                        {
                            [Op.between]: [startDate, stopDate]
                        },
                    name:
                        {
                            [Op.in]: statesJson
                        }
                }
                , group: ['name']
            }
        )

    ));

    return res.status(200).json({
        TableData, totalOne: counter.length, totalPages: Math.floor(counter.length / 11) + 1, curPage: page
    });
}


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