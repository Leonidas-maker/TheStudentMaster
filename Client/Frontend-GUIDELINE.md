# React TypeScript Project Structure and Development Guidelines

These guidelines are designed to ensure consistency and maintainability within our TypeScript React project. By following these conventions, we aim to improve code readability and make our project easier to manage.

## 1. Project Structure and Naming Conventions

- **Directories and Files**: Organize code logically into specific directories named for their purpose or functionality. Maintain a clear hierarchy for component directories.
- **File Naming Conventions**: Use PascalCase for React components and camelCase for instances, functions, and other variables.

| Element           | Convention                   | Example                 |
|-------------------|------------------------------|-------------------------|
| Component files   | PascalCase                   | `Dashboard.tsx`         |
| Function names    | camelCase                    | `fetchUserData`         |
| Variable names    | camelCase                    | `userData`              |
| Hook files        | camelCase with 'use' prefix  | `useUserProfile.ts`     |
| Constants         | Uppercase with underscores   | `API_BASE_URL`          |
| Service files     | camelCase                    | `apiClient.ts`          |
| Utility files     | camelCase                    | `stringUtils.ts`        |
| Test files        | PascalCase with `.test` suffix | `Dashboard.test.tsx`  |

## 2. React Components and Screens

- **Component Organization**: Group related components within the same folder. For example, all profile-related components reside under `profile/`.
- **Screens**: Place screen components within the `screens/` directory, with each screen in its own sub-directory reflecting its purpose.

## 3. Routing

- **Routing**: Store route components in the `routes/` directory. Use descriptive names for route files, such as `HomeBottomTabs.tsx` and `SettingsStack.tsx`.


## 4. Styles and Static Resources

- **Stylesheets**: Use a global stylesheet for common styles across the app, and component-specific styles defined in corresponding component files or nearby stylesheets.
- **Static Resources**: Organize images, icons, and other static resources under the `public/` directory. Group them by type and usage.

## 5. Translations and Localization

- **Translation Configurations**: Store translation configurations and language-specific files under the `translations/` directory.
- **Maintainability**: Ensure each language file corresponds to a specific locale and is easy to update.

## 6. Testing and Documentation

- **Test Files**: Place test files next to their corresponding component files with a `.test.tsx` suffix.
- **Documentation**: Provide comprehensive README files and in-code comments to explain complex logic.

## 7. Version Control and Development Tools

- **.gitignore**: Configure to exclude build outputs, node modules, and other system-specific files.
- **Code Formatting**: Use tools like Prettier or ESLint to enforce coding standards.

## 8. Configuration and Build Tools

- **TypeScript Configuration (`tsconfig.json`)**: Maintain a project-wide TypeScript configuration for compiler options.
- **Metro and Expo Configurations**: Configure Metro bundler and Expo settings in `metro.config.js` and respective `.expo/` files to optimize build processes.
