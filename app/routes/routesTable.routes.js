module.exports = app => {
    const routeTable = require("../controllers/aformattable.controller.js");

    var router = require("express").Router();

    router.post("/", routeTable.create);

    //Получить полные данные по таблице с параметрами
    router.get("/",  routeTable.findAllAsync);

    //Получить данные по направлению
    router.get("/detail",  routeTable.GetDetail);

    router.get("/published", routeTable.findAllPublished);

    router.get("/:id", routeTable.findOne);

    router.put("/:id", routeTable.update);

    router.delete("/:id", routeTable.delete);

    router.delete("/", routeTable.deleteAll);

    app.use('/api/routesTable', router);
};