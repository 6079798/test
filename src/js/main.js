import "mdn-polyfills/Element.prototype.matches"
import "mdn-polyfills/Element.prototype.closest"
import "mdn-polyfills/NodeList.prototype.forEach"
import "mdn-polyfills/Array.prototype.includes"
import "mdn-polyfills/Array.from"
import "mdn-polyfills/Object.assign"
import "mdn-polyfills/CustomEvent"
import "formdata-polyfill"

import Choices from "choices.js/public/assets/scripts/choices.min.js"
import Vivus from "vivus/dist/vivus.min.js"

import "./form"

document.querySelectorAll("[data-select]").forEach(
	el =>
		new Choices(el, {
			paste: false,
			shouldSort: false,
			position: "bottom",
		})
)

const container = document.querySelector("[data-animate]")
const bcgContainer = document.querySelector("[data-bcg]")

container.addEventListener("transitionend", e => {
	if (!e.target.matches(".form__item")) return
	if (e.propertyName === "transform") {
		const next = e.target.nextElementSibling
		if (next) {
			setTimeout(() => {
				next.classList.remove("form__item--move")
			}, 200)
		} else {
			new Vivus(bcgContainer, {
				duration: 100,
				reverseStack: true,
				file: "/img/form-bcg.svg",
			})
		}
	}
})

window.addEventListener("load", () => {
	container
		.querySelector(".form__item--move")
		.classList.remove("form__item--move")
})
