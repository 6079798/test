import { validateSignupForm } from "./utils/validators"

const form = document.forms[0]

const showFormErrors = (errorsObj, form) => {
	form.querySelectorAll(".form__text--error").forEach(el => (el.innerHTML = ""))
	for (let error in errorsObj) {
		const parent = form
			.querySelector(`[name="${error}"]`)
			.closest(".form__item")
		if (parent) {
			const errors =
				errorsObj[error].length > 1
					? errorsObj[error].join("<br>")
					: errorsObj[error].join()
			parent.querySelector("span.form__text--error").innerHTML = errors
		}
	}
}

const getFormData = form => {
	const formData = new FormData(form)
	let data = {}
	for (let item of formData.entries()) {
		data = {
			...data,
			[item[0]]: item[1],
		}
	}
	return data
}

const handleKeyup = () => {
	const { errors } = validateSignupForm(getFormData(form))
	showFormErrors(errors, form)
}

const doSubmit = e => {
	e.preventDefault()
	const { errors, valid } = validateSignupForm(getFormData(e.target))
	if (!valid) {
		form.classList.add("form--error")
		showFormErrors(errors, form)
		form.addEventListener("keyup", handleKeyup)
	} else {
		form.reset()
		form.removeEventListener("keyup", handleKeyup)
		console.log("Valid")
	}
}

form.addEventListener("submit", doSubmit)
form
	.querySelector(".form__submit")
	.addEventListener("animationend", ({ target }) => {
		form.classList.remove("form--error")
		target.offsetWidth
	})
