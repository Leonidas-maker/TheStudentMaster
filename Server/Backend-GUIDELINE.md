# FastAPI Backend Structure and Development Guidelines

These guidelines are designed to ensure consistency and maintainability within our FastAPI project. We adhere to industry-standard naming conventions for Python to improve readability and manageability.

## 1. Project Structure and Naming Conventions

- **Directories and Files**: Organize code by functionality into specific directories. Name files according to their specific function.
- **`__init__.py` Files**: Each directory containing Python modules should include an `__init__.py` to denote it as a package.
- **Naming Conventions**: Follow industry standards for naming variables, functions, classes, and modules in Python. See the table below for examples.

| Element        | Convention                   | Example                 |
|----------------|------------------------------|-------------------------|
| Class names    | CamelCase                    | `DatabaseManager`       |
| Function names | Lowercase with underscores   | `update_record`         |
| Variable names | Lowercase with underscores   | `user_id`               |
| Module names   | Lowercase without spaces     | `email_utils`           |
| Constants      | Uppercase with underscores   | `MAX_CONNECTIONS`       |
| Controller files | Lowercase with underscores | `user_controller.py`    |

## 2. Data Models and Schemas

- **SQL Models (`models/sql_models`)**: Define database tables in separate files, named as `m_<table_name>.py`.
- **Pydantic Schemas (`models/pydantic_schemas`)**: Data transfer schemas should be named `s_<schema_name>.py`.

## 3. Business Logic and API Routes

- **Middleware (`middleware`)**: Middleware modules should clearly define specific functionalities.
- **Routes (`routes`)**: API endpoints should be organized into modules named according to their functionality.
- **Controllers (`controllers`)**: Controllers should manage the logic associated with their respective models. Organize controller actions into specific files, such as `user_controller.py`, and ensure methods are clear and functional.

## 4. Configuration and Security

- **Configuration Files (`config`)**: Use separate modules for security settings and database configurations.
- **JWT Keys (`middleware/jwt_keys`)**: Keys should be securely stored and never included in version control.

## 5. Email Templates and Data Management

- **Email Templates (`data/email`)**: Organize email templates and related data by state or purpose in subdirectories.

## 6. Testing and Documentation

- **Test Files (`test`)**: Organize tests separately and name them following the `test_<component_name>` schema.
- **Documentation**: Create a `README.md` and thoroughly comment your code.

## 7. Version Control and Development Tools

- **.gitignore**: Exclude all temporary files and generated files like `__pycache__` from version control.
