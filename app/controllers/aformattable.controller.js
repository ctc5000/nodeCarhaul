const db = require("../models");
const RouteTable = db.aformattable;
const Distance = db.Distance;
const Trends = db.Trends;
const Dictionary = db.DictionaryRoutes;
const CitiesRoutes = db.CitiesRoutes;
const Op = db.Sequelize.Op;
const operatorsAliases = {
    $eq: Op.eq,
    $ne: Op.ne,
    $gte: Op.gte,
    $gt: Op.gt,
    $lte: Op.lte,
    $lt: Op.lt,
    $not: Op.not,
    $in: Op.in,
    $notIn: Op.notIn,
    $is: Op.is,
    $like: Op.like,
    $notLike: Op.notLike,
    $iLike: Op.iLike,
    $notILike: Op.notILike,
    $regexp: Op.regexp,
    $notRegexp: Op.notRegexp,
    $iRegexp: Op.iRegexp,
    $notIRegexp: Op.notIRegexp,
    $between: Op.between,
    $notBetween: Op.notBetween,
    $overlap: Op.overlap,
    $contains: Op.contains,
    $contained: Op.contained,
    $adjacent: Op.adjacent,
    $strictLeft: Op.strictLeft,
    $strictRight: Op.strictRight,
    $noExtendRight: Op.noExtendRight,
    $noExtendLeft: Op.noExtendLeft,
    $and: Op.and,
    $or: Op.or,
    $any: Op.any,
    $all: Op.all,
    $values: Op.values,
    $col: Op.col
};
let TryThis;
/*
* Создание записи таблицы
*/
exports.createRowFormatTables = async (req, res) => {
    console.log("True action insert data to main table");
    if (!req.body.name) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }
    let {
         name,
    } = req.body;

    let type=0,
        low=0,
        mid=0,
        high=0,
        mile=0,
        volume=0;

    let splitedBody = name.split(",");
    name =splitedBody[0];
    type = splitedBody[1];
    low = splitedBody[2];
    mid = splitedBody[3];
    high = splitedBody[4];
    volume = splitedBody[5];
    mile = splitedBody[6];

    console.log(req.body);
    const datecreate = new Date();
    let distid = 0;
    let routeName = name;
    const state1 = await Dictionary.findOne({
        attributes:
            [
                'value',
            ],
        where: {
            name: name.substring(0, 2),
        }
    });
    const state2 =
        await Dictionary.findOne({
            attributes:
                [
                    'value',
                ],
            where: {
                name: name.substring(2, 4),
            }
        });

    let dist = await Promise.all((await Distance.findAll({
            attributes: [
                'id',
            ],
            where: {
                name: [routeName],
            }
        })),
    );
    for (key in dist[0]['dataValues']) {
        distid = dist[0]['dataValues'][key];
    }
    await RouteTable.build({
        type: type,
        name: name,
        route: state1.value + ',' + state2.value,
        datecreate: datecreate,
        low: low,
        mid: mid,
        high: high,
        mile: mile,
        volume: volume,
        distanceId: distid,
        createdAt: new Date(),
        updatedAt: new Date(),

    }).save()
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the Tutorial."
            });
        });
};


/*
* Поиск трендов по шатату
*/
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
            intervaldate: 30,
        }
    })));

    return res.status(200).json({
        TrendsReturn
    });
}


/*
* Получить данные по направлению
*/
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
    GraphPoints= GraphPoints.reverse();

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
                        namestate: it.name.substring(0, 2),
                        intervaldate: 30,
                    }
                }),
            trend2:
                await Trends.findOne({
                    attributes:
                        [
                            'value',
                        ],
                    where: {
                        namestate: it.name.substring(2, 4),
                        intervaldate: 30,
                    }
                }),


        }))
    )
    return res.status(200).json({Deatail, GraphPoints: GraphPoints});
}

/*
* Получить полные данные по таблице с параметрами
*/
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
        states = ["ALAR"]
    } = req.query;
    let statesJson = "";


    let where =  {
        datecreate:
        {
            [Op.between]: [startDate, stopDate]
        },
    };

    if (states.length === 1 || states==="[]") {
        //return res.status(500).json('null parse data');
    }
    else
    {
        statesJson = JSON.parse(states);
        where.name =  {[Op.in]: statesJson};

    }




    order = [[sortField, sortType]];

    if (sortField === "avgPrice") order = [[db.sequelize.fn('AVG', db.sequelize.col('mid')), sortType]];
    if (sortField === "avgVolume") order = [[db.sequelize.fn('AVG', db.sequelize.col('volume')), sortType]];

    if (sortField === "trends") {
        let TrendsData = await Promise.all((await Trends.findAll({
            offset: page * 11,
            limit: 11,
            where: {
                intervaldate: 30,
                value: {
                    [Op.ne]: 0
                }
            },

            order: [['value', 'DESC']]
        })));
        let ArrNames = [], ArrRouteNames = [];
        TrendsData.forEach(function (item) {
            ArrNames.push(item.namestate);
        });
        let DictionaryData = await Promise.all((await Dictionary.findAll({
            attributes: ['name']
        })));
        ArrNames.forEach(function (item1) {
            DictionaryData.forEach(function (item2) {
                ArrRouteNames.push(item1 + "" + item2.name);

            });

        });

        let TableDataByTrends = await Promise.all((await RouteTable.findAll({
            offset: page * 11,
            limit: 11,
            where: {
                datecreate:
                    {
                        [Op.between]: [startDate, stopDate]
                    },
                name:
                    {
                        [Op.in]: ArrRouteNames
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
                        namestate: it.name.substring(0, 2),
                        intervaldate: 30,
                    }
                }),
            trend2:
                await Trends.findOne({
                    attributes:
                        [
                            'value',
                        ],
                    where: {
                        namestate: it.name.substring(2, 4),
                        intervaldate: 30,
                    }
                }),
            city1:
                await CitiesRoutes.findOne({
                    where: {
                        FromState: it.name.substring(0, 2),
                    }
                }),
            city2:
                await CitiesRoutes.findOne({
                    where: {
                        ToState: it.name.substring(2, 4),
                    }
                }),
            profit: (8 * it.mid) - ((it.Distances.distance / 6.5) * 2.6),


        })));



        return res.status(200).json({
            TableDataByTrends
        });
    }


    let TableData = await Promise.all((await RouteTable.findAll({
        offset: page * 11,
        limit: 11,
        where,
     /*   where: {
            datecreate:
                {
                    [Op.between]: [startDate, stopDate]
                },
        },*/
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
                    namestate: it.name.substring(0, 2),
                    intervaldate: 30,
                }
            }),
        trend2:
            await Trends.findOne({
                attributes:
                    [
                        'value',
                    ],
                where: {
                    namestate: it.name.substring(2, 4),
                    intervaldate: 30,
                }
            }),
        city1:
            await CitiesRoutes.findOne({
                where: {
                    FromState: it.name.substring(0, 2),
                }
            }),
        city2:
            await CitiesRoutes.findOne({
                where: {
                    ToState: it.name.substring(2, 4),
                }
            }),
        profit: (8 * it.mid) - ((it.Distances.distance / 6.5) * 2.6),


    })));

    let counter = await Promise.all((

        await RouteTable.count(
            {
                where,
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
                }]
                , group: ['name']
            }
        )

    ));

    return res.status(200).json({
        TableData, totalOne: counter.length, totalPages: Math.floor(counter.length / 11) + 1, curPage: page
    });
}

/*
* Получить полные данные по таблице с параметрами и фильтром
*/
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
                    namestate: it.name.substring(0, 2),
                    intervaldate: 30,
                }
            }),
        trend2:
            await Trends.findOne({
                attributes:
                    [
                        'value',
                    ],
                where: {
                    namestate: it.name.substring(2, 4),
                    intervaldate: 30,
                }
            }),
        city1:
            await CitiesRoutes.findOne({
                where: {
                    FromState: it.name.substring(0, 2),
                }
            }),
        city2:
            await CitiesRoutes.findOne({
                where: {
                    ToState: it.name.substring(2, 4),
                }
            }),
        profit: (8 * it.mid) - ((it.Distances.distance / 6.5) * 2.6),
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


/*Получить 5 записей с рекомендациями по направлению*/
exports.findAllDetailAsyncFiltered = async (req, res) => {
    console.log("True action findAllAsyncFilteredDetail");
    let dateStart = new Date();
    let {
        state = "AL",
        startDate = dateStart,
        stopDate = new Date(),

    } = req.query;


    let TableData = await Promise.all((await Dictionary.findAll({
        attributes: ['name']
    })).map(async (it) => ({
        ...(it.toJSON()),
        name: state + it.name,
    })));
    let order = [["mid", 'DESC']];

    let ArrNames = [];
    TableData.forEach(function (item) {
        ArrNames.push(item.name);
    });

    console.log(ArrNames);
    let DataTable = await Promise.all((

        await RouteTable.findAll({
            offset: 0,
            limit: 5,
            where: {
                name:
                    {
                        [Op.in]: ArrNames
                    },
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
                            [Op.between]: [0, 10000]
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
                    namestate: it.name.substring(0, 2),
                    intervaldate: 30,
                }
            }),
        trend2:
            await Trends.findOne({
                attributes:
                    [
                        'value',
                    ],
                where: {
                    namestate: it.name.substring(2, 4),
                    intervaldate: 30,
                }
            }),
        city1:
            await CitiesRoutes.findOne({
                where: {
                    FromState: it.name.substring(0, 2),
                }
            }),
        city2:
            await CitiesRoutes.findOne({
                where: {
                    ToState: it.name.substring(2, 4),
                }
            }),
        profit: (8 * it.mid) - ((it.Distances.distance / 6.5) * 2.6),
    })));

    return res.status(200).json({
        DataTable
    });
}

