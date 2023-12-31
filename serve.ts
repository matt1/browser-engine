import { serve } from "https://deno.land/std@0.177.0/http/mod.ts";
import { serveDirWithTs } from "https://deno.land/x/ts_serve@v1.4.4/mod.ts";

/** 
 * Simply serve the local directory - by default this will load index.html and
 * everything else will go from there.
 */
serve((request:Request) => serveDirWithTs(request));