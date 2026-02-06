-- Agregar campo observaciones a la tabla memorandum_comision
ALTER TABLE public.memorandum_comision 
ADD COLUMN observaciones text COLLATE pg_catalog."default";

-- Agregar comentario al campo
COMMENT ON COLUMN public.memorandum_comision.observaciones IS 'Observaciones adicionales del memorandum/comisión';