const isEmpty = string => {
	const errors = []
	if (string.trim() === "") errors.push("Must not be empty.")
	return {
		errors,
		valid: errors.length === 0,
	}
}

const isValidName = string => {
	const errors = []
	const regexp = /^[a-z ,.'-]+$/i
	if (!regexp.test(string)) errors.push("Must contains only letters.")
	return {
		errors,
		valid: errors.length === 0,
	}
}

const isEmail = email => {
	const errors = []
	const regexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
	if (!regexp.test(email)) errors.push("Must be a valid email.")
	return {
		errors,
		valid: errors.length === 0,
	}
}

const isPasswordsEqual = (pass, confirm) => {
	const errors = []
	if (pass.trim() !== confirm.trim()) {
		errors.push("Passwords must match.")
	}
	return {
		errors,
		valid: errors.length === 0,
	}
}

const checkPasswordStrength = password => {
	const errors = []
	const rules = [
		{
			message: "Must be at least 8 characters long.",
			regexp: "^.{8,}$",
		},

		{
			message: "Must contains at least one uppercase letter.",
			regexp: "[A-Z]",
		},
		{
			message: "Must contains at least one digit.",
			regexp: "[0-9]",
		},
		{
			message: "Must contains at least one lowercase letter.",
			regexp: "[a-z]",
		},
	]
	rules.forEach(rule => {
		if (!new RegExp(rule.regexp).test(password)) {
			errors.push(rule.message)
		}
	})
	return {
		errors,
		valid: errors.length === 0,
	}
}

export const validateSignupForm = data => {
	const errors = {}
	let res

	res = isEmpty(data.firstName)
	if (!res.valid) errors.firstName = res.errors
	else {
		res = isValidName(data.firstName)
		if (!res.valid) errors.firstName = res.errors
	}

	res = isEmpty(data.lastName)
	if (!res.valid) errors.lastName = res.errors
	else {
		res = isValidName(data.lastName)
		if (!res.valid) errors.lastName = res.errors
	}

	res = isEmpty(data.email)
	if (!res.valid) errors.email = res.errors
	else {
		res = isEmail(data.email)
		if (!res.valid) errors.email = res.errors
	}

	res = checkPasswordStrength(data.password)
	if (!res.valid) errors.password = res.errors

	res = isEmpty(data.passwordConf)
	if (!res.valid) errors.passwordConf = res.errors
	else {
		res = isPasswordsEqual(data.password, data.passwordConf)
		if (!res.valid) {
			errors.passwordConf = res.errors
		}
	}

	return {
		errors,
		valid: Object.keys(errors).length === 0,
	}
}
