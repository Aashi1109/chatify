import * as Yup from "yup";

const groupValidationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  description: Yup.string().optional(),
});

export default groupValidationSchema;
