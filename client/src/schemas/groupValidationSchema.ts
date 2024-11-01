import * as Yup from "yup";

const groupValidationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  description: Yup.string().optional(),
  participants: Yup.array()
    .of(Yup.string())
    .min(1, "At least 1 user should be selected"),
});

export default groupValidationSchema;
