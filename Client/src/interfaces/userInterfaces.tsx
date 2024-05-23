interface UserProps {
  username: string | "";
  email: string | "";
  user_uuid: string | "";
  avatar: string | "";
  address:
    | {
        address1: string;
        address2: string;
        district: string;
        postal_code: string;
        city: string;
        country: string;
      }
    | "";
}

interface UniversityProps {
  university_name: string;
  university_uuid: string;
  course_names: string[];
}

interface UniversityDropdownItemProps {
  key: string;
  value: string;
}

export { UserProps, UniversityProps, UniversityDropdownItemProps };
