interface User {
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

interface User {
  username: string | "";
  email: string | "";
  uuid: string | "";
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

export { User };
