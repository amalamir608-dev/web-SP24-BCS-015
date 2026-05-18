const minSlider = document.getElementById("minSlider");
const maxSlider = document.getElementById("maxSlider");

const minValue = document.getElementById("minValue");
const maxValue = document.getElementById("maxValue");

minSlider.addEventListener("input", () => {

    if(Number(minSlider.value) >= Number(maxSlider.value)) {

        minSlider.value = maxSlider.value - 1;

    }

    minValue.textContent = "Rs " + minSlider.value;

});

maxSlider.addEventListener("input", () => {

    if(Number(maxSlider.value) <= Number(minSlider.value)) {

        maxSlider.value = Number(minSlider.value) + 1;

    }

    maxValue.textContent = "Rs " + maxSlider.value;

});