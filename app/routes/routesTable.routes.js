module.exports = app => {
    const routeTable = require("../controllers/aformattable.controller.js");

    var router = require("express").Router();

    router.post("/set", routeTable.createRowFormatTables);

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



    app.use('/api/routesTable', router);
};
