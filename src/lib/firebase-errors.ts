export function getFirebaseErrorMessage(error: any): string {
  if (!error.code) {
    return error.message || "An unknown error occurred.";
  }

  switch (error.code) {
    case 'auth/user-not-found':
      return 'No account found with this email address. Please check your email or sign up.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-email':
      return 'The email address is not valid. Please enter a correct email format.';
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please login or use a different email.';
    case 'auth/weak-password':
      return 'The password is too weak. Please use at least 6 characters.';
    case 'auth/requires-recent-login':
      return 'This action requires you to have recently logged in. Please log out and log back in.';
    case 'auth/network-request-failed':
        return 'A network error occurred. Please check your internet connection and try again.'
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}
