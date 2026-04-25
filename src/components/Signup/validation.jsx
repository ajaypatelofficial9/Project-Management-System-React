import * as Yup from "yup";
const SignupFormschema = Yup.object().shape({
    firstName: Yup.string()
        .required("First Name is a required field")
        .min(2, "First Name must be at least 2 characters")
        .matches(/^[a-zA-Z\s]+$/, "First Name can only contain letters and spaces"),
    lastName: Yup.string()
        .required("Last Name is a required field")
        .min(2, "Last Name must be at least 2 characters")
        .matches(/^[a-zA-Z\s]+$/, "Last Name can only contain letters and spaces"),
    address: Yup.string()
        .required("Address is a required field")
        .min(5, "Address must be at least 5 characters")
        .max(100, "Address cannot exceed 100 characters"),
    email: Yup.string()
        .required("Email is a required field")
        .email("Invalid email format"),
    password: Yup.string()
        .required("Password is a required field")
        .min(8, "Password must be at least 8 characters")
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
            "Password must contain uppercase, lowercase, number, and special character"
        ),
});

export default SignupFormschema;