/** 
 * Basic statement assertion that is required while ts_serve cannot handle
 * assertions from the core packages.
 */
export function assert(statement:boolean, message:string) {
  if (!statement) {
    console.error(message);
  }
}