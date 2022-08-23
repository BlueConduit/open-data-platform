/**
 * Stores info about error.
 */
interface StatusState {
  status: Status;
  // User-facing error.
  message?: string;
  // Optional code to indicate type of error.
  code?: string;
}

/** Current status **/
enum Status {
  success = 'success',
  error = 'error',
  pending = 'pending',
}

export { StatusState, Status };
