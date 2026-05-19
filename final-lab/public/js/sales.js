$(document).ready(function() {

    setInterval(function() {

        $.getJSON("/api/sales-data", function(data) {

            $("#totalRevenue").text(
                "Rs " + data.totalRevenue
            );

            $("#totalOrders").text(
                data.totalOrders
            );

            $("#topProduct").text(
                data.topProduct
            );

        });

    }, 10000);

});