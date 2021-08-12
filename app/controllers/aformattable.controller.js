const db = require("../models");
const RouteTable = db.aformattable;
const Distance = db.Distance;
const Trends = db.Trends;
const Dictionary = db.DictionaryRoutes;
const CitiesRoutes = db.CitiesRoutes;
const Users = db.Users;
const userToRoute = db.userToRoute;
const car = db.car;
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
const crypto = require('crypto');
/*
* Создание записи таблицы
*/
exports.createRowFormatTables = async ({body: {name}}, res) => {
    console.log("True action insert data to main table");
    if (!name) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }
    let splitedBody = name.split(","),
        routeName = splitedBody[0],
        type = splitedBody[1],
        low = splitedBody[2],
        mid = splitedBody[3],
        high = splitedBody[4],
        volume = splitedBody[5],
        mile = splitedBody[6];
    const datecreate = new Date();
    let distid = 0;

    const state1 = await Dictionary.findOne({
        attributes:
            [
                'value',
            ],
        where: {
            name: routeName.substring(0, 2),
        }
    });
    const state2 =
        await Dictionary.findOne({
            attributes:
                [
                    'value',
                ],
            where: {
                name: routeName.substring(2, 4),
            }
        });

    let dist = await Distance.findAll({
        attributes: [
            'id',
        ],
        where: {
            name: [routeName],
        }
    });
    for (let key in dist[0]['dataValues']) {
        distid = dist[0]['dataValues'][key];
    }
    await RouteTable.build({
        type: type,
        name: routeName,
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
exports.findAllTrendsAsync = async ({query: {namestate}}, res) => {
    console.log("True action findAllTrendsAsync");
    const where = {intervaldate: 30};
    if (!!namestate) {
        where.namestate = namestate;
    }
    return res.status(200).json(await Trends.findAll({
        attributes: ['value'],
        where
    }));
}


/*
* Получить данные по направлению
*/
exports.GetDetail = async ({query: {routeName, startDate, stopDate}}, res) => {
    if (!routeName) {
        res.status(400).send({
            message: "Route Name can not be empty!"
        });
    }
    if (!startDate) {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
    }
    if (!stopDate) {
        stopDate = new Date();
    }
    return res.status(200).json({
        Deatail: await RouteTable.findAll({
            attributes: [
                'id',
                'name',
                'mile',
                'route',
                'mid',
                'volume',
                [db.sequelize.fn('AVG', db.sequelize.col('volume')), 'avgVolume'],
                [db.sequelize.fn('AVG', db.sequelize.col('mid')), "avgPrice"],
                [db.sequelize.literal(`(SELECT value FROM trendsparams AS ts 
                    WHERE ts.intervaldate = 30 AND ts.namestate = SUBSTRING(\`aformattable\`.\`name\`,1,2))`), 'trend1'],
                [db.sequelize.literal(`(SELECT value FROM trendsparams AS ts 
                    WHERE ts.intervaldate = 30 AND ts.namestate = SUBSTRING(\`aformattable\`.\`name\`,3,2))`), 'trend2'],

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
        }),
        GraphPoints: await RouteTable.findAll({
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
            order: [['datecreate', 'DESC']]
        })
    });
}

/*
* Получить полные данные по таблице с параметрами
*/
exports.findAllAsync = async ({
                                  query: {
                                      page,
                                      count = 11,
                                      minMiles = 0,
                                      maxMiles = 10000,
                                      sortField,
                                      sortType = "ASC",
                                      startDate,
                                      stopDate,
                                      states = ["ALAR"]
                                  }
                              }, res) => {
    console.log("True action findAllAsync");
    if (!startDate) {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
    }
    if (!stopDate) {
        stopDate = new Date();
    }

    let statesJson = "";
    let where = {
        datecreate: {[Op.between]: [startDate, stopDate]},
    };
    let whereAllCount = {name: {[Op.ne]: null}}
    if (states.length > 1 && states !== "[]") {
        statesJson = JSON.parse(states);
        where.name = {[Op.in]: statesJson};
        whereAllCount.name = {[Op.in]: statesJson};
    }

    let order = [["name", "ASC"]],
        sorts = {
            name: [["name", sortType]],
            mile: [["mile", sortType]],
            mid: [["mid", sortType]],
            avgPrice: [[db.sequelize.fn('AVG', db.sequelize.col('mid')), sortType]],
            avgVolume: [[db.sequelize.fn('AVG', db.sequelize.col('volume')), sortType]]

        };
    if (sorts[sortField]) {
        order = sorts[sortField];
    }


//отрефакторить позже
    if (sortField === "trends") {
        let TrendsData = await Trends.findAll({
            offset: page * count,
            limit: count,
            where: {
                intervaldate: 30,
                value: {
                    [Op.ne]: 0
                }
            },

            order: [['value', 'DESC']]
        });
        let ArrNames = [], ArrRouteNames = [];
        TrendsData.forEach(function (item) {
            ArrNames.push(item.namestate);
        });
        let DictionaryData = await Dictionary.findAll({
            attributes: ['name']
        });
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
                [db.sequelize.literal(`(SELECT value FROM trendsparams AS ts 
                    WHERE ts.intervaldate = 30 AND ts.namestate = SUBSTRING(\`aformattable\`.\`name\`,1,2))`), 'trend1'],
                [db.sequelize.literal(`(SELECT value FROM trendsparams AS ts 
                    WHERE ts.intervaldate = 30 AND ts.namestate = SUBSTRING(\`aformattable\`.\`name\`,3,2))`), 'trend2'],
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

    let counter = await RouteTable.count(
        {
            distinct: true,
            col: 'name',
            where,
            include: {// Notice `include` takes an ARRAY
                model: Distance,
                as: 'Distances',
                attributes: [],
                where: {
                    distance:
                        {
                            [Op.between]: [minMiles, maxMiles]
                        }
                }
            }
        }
    );

    let TableData = [];
    let addParamsArray = [];
    if (counter > 0) {
        (await RouteTable.findAll(
            {
                attributes: [
                    'name',
                    [db.sequelize.fn('AVG', db.sequelize.col('mid')), "avgAllPrice"],
                    [db.sequelize.fn('AVG', db.sequelize.col('volume')), "avgAllVollume"],
                ],
                where: whereAllCount,
                group: ['name'],
                logging: console.log
            }
        )).map(it => {
            addParamsArray[it.name] = it.toJSON();
        });
        TableData = await Promise.all((await RouteTable.findAll({
            offset: page * count,
            limit: count,
            where,
            attributes: [
                'id',
                'name',
                'mile',
                'route',
                'mid',
                'volume',
                [db.sequelize.fn('AVG', db.sequelize.col('volume')), 'avgVolume'],
                [db.sequelize.fn('AVG', db.sequelize.col('mid')), "avgPrice"],
                [db.sequelize.literal(`(SELECT value FROM trendsparams AS ts 
                    WHERE ts.intervaldate = 30 AND ts.namestate = SUBSTRING(\`aformattable\`.\`name\`,1,2))`), 'trend1'],
                [db.sequelize.literal(`(SELECT value FROM trendsparams AS ts 
                    WHERE ts.intervaldate = 30 AND ts.namestate = SUBSTRING(\`aformattable\`.\`name\`,3,2))`), 'trend2'],
                [db.sequelize.literal(`(SELECT DISTINCT FromCity FROM CitiesRoutes AS sr 
                    WHERE sr.FromState = SUBSTRING(\`aformattable\`.\`name\`,1,2))`), 'city1'],
                [db.sequelize.literal(`(SELECT DISTINCT ToCity FROM CitiesRoutes AS sr 
                    WHERE sr.ToState = SUBSTRING(\`aformattable\`.\`name\`,3,2))`), 'city2'],
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
            order
        })).map(async (it) => ({
            ...(it.toJSON()),
            addParams: addParamsArray[it.name],
            route: it.route.split(','),
            pm: it.mid / it.mile,
            profit: (8 * it.mid) - ((it.Distances.distance / 6.5) * 2.6),
        })));
    }

    return res.status(200).json({
        TableData, totalOne: counter, totalPages: Math.floor(counter / count) + 1, curPage: page
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
                [db.sequelize.literal(`(SELECT value FROM trendsparams AS ts 
                    WHERE ts.intervaldate = 30 AND ts.namestate = SUBSTRING(\`aformattable\`.\`name\`,1,2))`), 'trend1'],
                [db.sequelize.literal(`(SELECT value FROM trendsparams AS ts 
                    WHERE ts.intervaldate = 30 AND ts.namestate = SUBSTRING(\`aformattable\`.\`name\`,3,2))`), 'trend2'],
                [db.sequelize.literal(`(SELECT DISTINCT FromCity FROM CitiesRoutes AS sr 
                    WHERE sr.FromState = SUBSTRING(\`aformattable\`.\`name\`,1,2))`), 'city1'],
                [db.sequelize.literal(`(SELECT DISTINCT ToCity FROM CitiesRoutes AS sr 
                    WHERE sr.ToState = SUBSTRING(\`aformattable\`.\`name\`,3,2))`), 'city2'],
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
        profit: (8 * it.mid) - ((it.Distances.distance / 6.5) * 2.6),
    })));

    return res.status(200).json({
        DataTable
    });
}


exports.findCityes = async (req, res) => {
    let {state = "AL-AR"} = req.query;

    let TableData = await CitiesRoutes.findOne({
        attributes: ["FromCity"],
        where: {
            FromState: state.substring(0, 2),
        }
    });
    let TableData2 = await CitiesRoutes.findOne({
        attributes: ["FromCity"],
        where: {
            FromState: state.substring(3, 5),
        }
    });
    let str = TableData["FromCity"] + '-' + TableData2["FromCity"];
    return res.status(200).json({
        str
    });
}


exports.setUserToRoute = async ({body: {userId, routeName}}, res) => {
    if (!userId) {
        return res.status(400).send({
            message: "User can not be empty!"
        });
    }
    if (!routeName) {
        return res.status(400).send({
            message: "RouteName can not be empty!"
        });
    }
    const User = await Users.findOne({
        attributes: ['id'],
        where: {
            id: userId,
        }
    });
    if (!User) {
        return res.status(404).send({
            message: "User not found!"
        });
    }

    await userToRoute.build({
        userId: userId,
        routeName: routeName,
    }).save()
        .then(data => {
            return res.send(data);
        })
        .catch(err => {
            return res.status(500).send({
                message:
                    err.message || "Some error occurred while save user to route."
            });
        });
};


exports.setUser = async ({params: {userId}, body: {user_login, user_pass, user_nicename, user_email, display_name, ratio}}, res) => {

    const User = await Users.findOne({
        attributes: [`id`, `user_status`, `user_login`, `user_pass`, `user_nicename`, `user_email`, `user_url`, `display_name`, `ratio`],
        where: {
            id: userId,
        }
    });
    if (!User) {
        return res.status(404).send({
            message: "User not found!"
        });
    }
    if (user_login) User.user_login = user_login;
    if (user_pass) User.user_pass = crypto.createHash('md5').update(user_pass).digest('hex');
    if (user_nicename) User.user_nicename = user_nicename;
    if (user_email) User.user_email = user_email;
    if (display_name) User.display_name = display_name;
    if (ratio) User.ratio = ratio;
    const error = User.validate();
    if (error) return res.status(500).json(error);
    await User.save();
    return res.status(200).json(User);
};
exports.setUserCar = async ({params: {userId}, body: {carId, name, type, volume}}, res) => {

    const User = await Users.findOne({
        attributes: [`id`],
        where: {
            id: userId,
        }
    });
    if (!User) {
        return res.status(404).send({
            message: "User not found!"
        });
    }
    let cars = undefined;
    if (carId) {
        cars = await car.findOne({
            attributes: [`id`],
            where: {
                id: carId,
            }
        });
        if (!cars) {
            return res.status(404).send({
                message: "Car not found!"
            });
        }
        car.setData({
            name: name,
            type: type,
            volume: volume,
            userId:userId
        });
    } else {
        cars = await car.build({
            name: name,
            type: type,
            volume: volume,
            userId:userId
        });
    }

    const error = cars.validate();
    if (error) return res.status(500).json(error);
    await cars.save();
    return res.status(200).json(cars);
};
exports.getUser = async ({params: {userId}}, res) => {

    const User = await Users.findOne({
        attributes: [`id`, `user_status`, `user_login`, `user_pass`, `user_nicename`, `user_email`, `user_url`, `display_name`, `ratio`],
        where: {
            id: userId,
        },
        include: {
            model: db.car,
            as: 'cars'
        }
    });
    if (!User) {
        return res.status(404).send({
            message: "User not found!"
        });
    }
    return res.status(200).json(User);
};


exports.getUserByRouteName = async ({query: {routeName, page = 0, count = 11}}, res) => {
    return res.status(200).json({
        users: await Users.findAll({
            attributes: ['id', 'display_name', 'user_status'],
            include: [{
                required: (!!routeName),
                model: userToRoute,
                as: 'Route',
                where: {
                    routeName: (routeName) ? routeName : {[Op.ne]: null}
                }
            }],
            order: [['display_name', 'ASC']],
            offset: page * count,
            limit: count,
            subQuery: false
        })
    });
}
exports.getRouteNameByUser = async ({query: {userId, page = 0, count = 11}}, res) => {
    return res.status(200).json({
        routeName: await userToRoute.findAll({
            distinct: true,
            attributes: ['routeName'],
            where: {
                userId: (userId) ? userId : {[Op.ne]: null}
            },
            offset: page * count,
            limit: count,
        })
    });
}
