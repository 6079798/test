import Choices from "choices.js"
import Vivus from "vivus"

document.querySelectorAll("[data-select]").forEach(
	el =>
		new Choices(el, {
			paste: false,
			shouldSort: false,
			position: "bottom",
		})
)

const container = document.querySelector("[data-animate]")
const firstElement = container.querySelector(".form__item")
const bcgContainer = document.querySelector("[data-bcg]")

if (firstElement) {
	firstElement.classList.remove("form__item--move")
	container.addEventListener("transitionend", ({ target }) => {
		if (!target.matches(".form__item")) return
		const next = target.nextElementSibling
		if (next) {
			next.classList.remove("form__item--move")
		} else {
			new Vivus(bcgContainer, {
				duration: 100,
				reverseStack: true,
				file: "/img/form-bcg.svg",
			})
		}
	})
}
