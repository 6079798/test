import toastr from "toastr"

import { validateSignupForm } from "./utils/validators"

toastr.options = {
	closeButton: true,
	newestOnTop: true,
	showDuration: "300",
	hideDuration: "1000",
	extendedTimeOut: "1000",
	showEasing: "swing",
	hideEasing: "linear",
	showMethod: "fadeIn",
	hideMethod: "fadeOut",
	timeOut: "6000",
}

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

const disableSubmitBtn = el => {
	el.classList.add("form__submit--disabled")
	el.setAttribute("data-original", el.textContent)
	el.textContent = "Sending..."
}

const enableSubmitBtn = el => {
	el.classList.remove("form__submit--disabled")
	el.textContent = el.getAttribute("data-original")
	el.removeAttribute("data-original")
}

const doSubmit = e => {
	e.preventDefault()
	const { errors, valid } = validateSignupForm(getFormData(form))
	const btn = form.querySelector(".form__submit")
	if (valid && !btn.hasAttribute("data-original")) {
		form.removeEventListener("keyup", handleKeyup)
		disableSubmitBtn(btn)
		const formData = new FormData(form)
		const xhr = new XMLHttpRequest()
		xhr.open(form.method, form.action)
		xhr.onreadystatechange = () => {
			if (xhr.readyState !== XMLHttpRequest.DONE) return
			if (xhr.status === 200) {
				toastr["success"]("<h3>Thank You!</h3><p>You registered!</p>")
				form.reset()
				enableSubmitBtn(btn)
			} else {
				toastr["error"]("<h3>Error!</h3><p>Try again later!</p>")
				enableSubmitBtn(btn)
			}
		}
		xhr.send(formData)
	} else {
		form.classList.add("form--error")
		showFormErrors(errors, form)
		form.addEventListener("keyup", handleKeyup)
	}
}

form.addEventListener("submit", doSubmit)
form
	.querySelector(".form__submit")
	.addEventListener("animationend", ({ target }) => {
		form.classList.remove("form--error")
		target.offsetWidth
	})
