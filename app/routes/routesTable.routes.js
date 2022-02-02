module.exports = app => {
    const routeTable = require("../controllers/aformattable.controller.js");

    var router = require("express").Router();

    router.post("/set", routeTable.createRowFormatTables);

    //Привязать пользователя к роуту. Передавать userId, routeName
    router.post("/setUserToRoute", routeTable.setUserToRoute);

    //Отвязать пользователя к роуту. Передавать userId, routeName
    router.delete("/setUserToRoute", routeTable. deleteUserToRoute);


    //Отредактировать пользователя
    router.post("/setUser/:userId", routeTable.setUser);
    router.post("/setUser", routeTable.createUser);

    //Отредактировать/добавить машину пользователя
    router.post("/setUserCar/:userId", routeTable.setUserCar);
    //удалить машину пользователя
    router.delete("/userCar/:userId", routeTable.deleteUserCar);



    //Получить полные данные по таблице с параметрами
    router.get("/",  routeTable.findAllAsync);

 //Получить полные данные по таблице с параметрами и фильтргом по states
    router.get("/states",  routeTable.findAllAsyncFiltered);

    //Получить данные по направлению
    router.get("/detail",  routeTable.GetDetail);

    //Получить данные направление по имени
    router.get("/routeByRouteName",  routeTable.GetDetailRoute);

    //Получить данные по направлению
    router.get("/trends",  routeTable.findAllTrendsAsync);
    //Получить рекомендации  по направлению
    router.get("/detailRayt",  routeTable.findAllDetailAsyncFiltered);
    //Получить города
    router.get("/cityes",  routeTable.findCityes);

    //Получить пользователей по имени маршрута routeName.
    // Если не передавать routeName вернет всех пользователей.
    // Доступна постраничная навигация page = 0, count = 11
    router.get("/getUserByRouteName",  routeTable.getUserByRouteName);

    //Получить список привязанных к пользователю маршрутов по id пользователя userId.
    // Если не передавать userId вернет все приписанные к пользователям маршруты.
    // Доступна постраничная навигация page = 0, count = 11
    router.get("/getRouteNameByUser",  routeTable.getRouteNameByUser);

    router.get("/getUser/:userId",  routeTable.getUser);
    router.post("/authUser",  routeTable.authUser);
    //Получить среднее значение за период в разбивке по дням неделям
    //Передавать дата с - dateFrom,  по -  dateTo, name - аббривиатура, например ALAR
    router.get("/getReportPerDay",  routeTable.getReportPerDay);

    app.use('/api/routesTable', router);
};
