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


    app.use('/api/routesTable', router);
};
