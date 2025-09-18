export type Accesorio = {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria: 'herraje' | 'sellado' | 'fijacion' | 'seguridad' | 'complemento';
  unidad: string; // 'unidad', 'metro', 'juego', 'caja'
  precioUnitario: number;
  compatibleCon: string[];
};

export const ACCESORIOS: Accesorio[] = [
  // HERRajes
  {
    id: 'MH56',
    nombre: 'Cierre lateral para corrediza Modena',
    categoria: 'herraje',
    unidad: 'unidad',
    precioUnitario: 5700,
    compatibleCon: ['corredizo']
  },
  {
    id: 'MR39',
    nombre: 'Rueda con rulemán fija (25 kg.)',
    categoria: 'herraje',
    unidad: 'unidad',
    precioUnitario: 3200,
    compatibleCon: ['corredizo']
  },

  // COMPLEMENTOS
  {
    id: 'MT69',
    nombre: 'Tapa de desagüe',
    categoria: 'complemento',
    unidad: 'unidad',
    precioUnitario: 450,
    compatibleCon: ['corredizo']
  },
  {
    id: 'MT89',
    nombre: 'Tope guía parante lateral',
    categoria: 'complemento',
    unidad: 'unidad',
    precioUnitario: 380,
    compatibleCon: ['corredizo']
  },
  {
    id: 'MT90',
    nombre: 'Tope guía parante central',
    categoria: 'complemento',
    unidad: 'unidad',
    precioUnitario: 380,
    compatibleCon: ['corredizo']
  },
  {
    id: 'MT91',
    nombre: 'Tapón lateral guía de condensación',
    categoria: 'complemento',
    unidad: 'unidad',
    precioUnitario: 280,
    compatibleCon: ['corredizo']
  },
  {
    id: 'MT92',
    nombre: 'Junta de estanqueidad marco',
    categoria: 'complemento',
    unidad: 'unidad',
    precioUnitario: 320,
    compatibleCon: ['corredizo']
  },
  {
    id: 'MT93',
    nombre: 'Tapón central cruce de hojas',
    categoria: 'complemento',
    unidad: 'unidad',
    precioUnitario: 420,
    compatibleCon: ['corredizo']
  },
  {
    id: 'MT94',
    nombre: 'Boca de desagüe',
    categoria: 'complemento',
    unidad: 'unidad',
    precioUnitario: 550,
    compatibleCon: ['corredizo']
  },
  {
    id: 'MT88',
    nombre: 'Taco regulador marco - premarco',
    categoria: 'complemento',
    unidad: 'unidad',
    precioUnitario: 180,
    compatibleCon: ['corredizo']
  },
  {
    id: 'MT95',
    nombre: 'Tapa tornillo',
    categoria: 'complemento',
    unidad: 'unidad',
    precioUnitario: 120,
    compatibleCon: ['corredizo']
  },

  // FIJACIÓN
  {
    id: 'TORNILLO_PARKER',
    nombre: 'Tornillo parker nº 10 x 1½"',
    categoria: 'fijacion',
    unidad: 'unidad',
    precioUnitario: 25,
    compatibleCon: ['corredizo', 'batiente', 'fijo', 'puerta']
  },

  // SELLADOS
  {
    id: 'MB31',
    nombre: 'Burlete cuña 4 mm',
    categoria: 'sellado',
    unidad: 'metro',
    precioUnitario: 380,
    compatibleCon: ['corredizo', 'batiente', 'fijo']
  },
  {
    id: 'MB69',
    nombre: 'Burlete marco-premarco',
    categoria: 'sellado',
    unidad: 'metro',
    precioUnitario: 420,
    compatibleCon: ['corredizo', 'batiente', 'fijo']
  },
  {
    id: 'MC14',
    nombre: 'Felpa 7 x 6 mm con Fin Seal',
    categoria: 'sellado',
    unidad: 'metro',
    precioUnitario: 520,
    compatibleCon: ['corredizo', 'batiente', 'fijo']
  }
];

// Helper functions
export const getAccesorio = (id: string): Accesorio | undefined => {
  return ACCESORIOS.find(a => a.id === id);
};

export const getAccesoriosPorCategoria = (categoria: string): Accesorio[] => {
  return ACCESORIOS.filter(a => a.categoria === categoria);
};



/*
mira, a la planilla de accesorios la hice un poco mas simple, porque no vendo cajas cerradas
no siempre compro por caja cerrada, los burletes se venden por metro y no por caja
bueno varias cosas asi me termine decidiendo por este fomato:

export type Accesorio = {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria: 'herraje' | 'sellado' | 'fijacion' | 'seguridad' | 'complemento';
  unidad: string; // 'unidad', 'metro', 'juego', 'caja'
  precioUnitario: number;
  compatibleCon: string[];
};

export const ACCESORIOS: Accesorio[] = [
  // HERRajes PARA CORREDIZAS
  {
    id: 'HM56',
    nombre: 'Cierre lateral ventana corrediza Modena',
    categoria: 'herraje',
    unidad: 'unidad',
    precioUnitario: 5700,
    compatibleCon: ['corredizo']
  }
];

ademas, ahora te paso una lista de accesorios para una ventana corrediza comun como las que estamos haciendo de 2 hojas.
necesito que a la lista de accesorios me lo agregues a nuestra lista
y que ademas me añadas los calculos a el cotizador y a la calculadora de la ventana corrediza. se entiende?
te dejo un par de ventanas de varias medidas a ver si podes calcular por tu cuenta las dimensiones de los burletes.
y bueno eso

1000x2000
MH56   Cierre lateral para corrediza (H56)                           2.00
MR39   Rueda con rulemán fija (25 kg.) (R39)                        4.00
MT69   Tapa de desagüe (T69)                                        2.00
MT89   Tope guía parante lateral (T89)                              4.00
MT90   Tope guía parante central (T90)                              4.00
MT91   Tapón lateral guía de condensación corrediza (T91)           8.00
MT92   Junta de estanqueidad marco (T92)                            4.00
MT93   Tapón central cruce de hojas MT-0200 (T93)                   2.00
MT94   Boca de desagüe (T94)                                        3.00
I      Tornillo parker nº 10 x 11/2"                               16.00
MT88   Taco regulador marco - premarco (T88)                       16.00
MT95   Tapa tornillo (T95)                                         16.00
I      Tornillo parker nº 10 x 11/2"                               16.00
MB31   Burlete cuña 4 mm (B31)                                     17.71
MB69   Burlete marco-premarco (B69)                                 6.00
MC14   Felpa 7 x 6 mm con Fin Seal (C14)                           11.63


2000x1000
MH56   Cierre lateral para corrediza (H56)                           2.00
MR39   Rueda con rulemán fija (25 kg.) (R39)                        4.00
MT69   Tapa de desagüe (T69)                                        2.00
MT89   Tope guía parante lateral (T89)                              4.00
MT90   Tope guía parante central (T90)                              4.00
MT91   Tapón lateral guía de condensación corrediza (T91)           8.00
MT92   Junta de estanqueidad marco (T92)                            4.00
MT93   Tapón central cruce de hojas MT-0200 (T93)                   2.00
MT94   Boca de desagüe (T94)                                        3.00
I      Tornillo parker nº 10 x 11/2"                               16.00
MT88   Taco regulador marco - premarco (T88)                       16.00
MT95   Tapa tornillo (T95)                                         16.00
I      Tornillo parker nº 10 x 11/2"                               16.00
MB31   Burlete cuña 4 mm (B31)                                     13.71
MB69   Burlete marco-premarco (B69)                                 6.00
MC14   Felpa 7 x 6 mm con Fin Seal (C14)                           11.63


2000x2000
MH56   Cierre lateral para corrediza (H56)                           2.00
MR39   Rueda con rulemán fija (25 kg.) (R39)                        4.00
MT69   Tapa de desagüe (T69)                                        2.00
MT89   Tope guía parante lateral (T89)                              4.00
MT90   Tope guía parante central (T90)                              4.00
MT91   Tapón lateral guía de condensación corrediza (T91)           8.00
MT92   Junta de estanqueidad marco (T92)                            4.00
MT93   Tapón central cruce de hojas MT-0200 (T93)                   2.00
MT94   Boca de desagüe (T94)                                        3.00
I      Tornillo parker nº 10 x 11/2"                               16.00
MT88   Taco regulador marco - premarco (T88)                       20.00
MT95   Tapa tornillo (T95)                                         20.00
I      Tornillo parker nº 10 x 11/2"                               20.00
MB31   Burlete cuña 4 mm (B31)                                     21.71
MB69   Burlete marco-premarco (B69)                                 8.00
MC14   Felpa 7 x 6 mm con Fin Seal (C14)                           15.63


1000x1000
MH56   Cierre lateral para corrediza (H56)                           2.00
MR39   Rueda con rulemán fija (25 kg.) (R39)                        4.00
MT69   Tapa de desagüe (T69)                                        2.00
MT89   Tope guía parante lateral (T89)                              4.00
MT90   Tope guía parante central (T90)                              4.00
MT91   Tapón lateral guía de condensación corrediza (T91)           8.00
MT92   Junta de estanqueidad marco (T92)                            4.00
MT93   Tapón central cruce de hojas MT-0200 (T93)                   2.00
MT94   Boca de desagüe (T94)                                        3.00
I      Tornillo parker nº 10 x 11/2"                               16.00
MT88   Taco regulador marco - premarco (T88)                       12.00
MT95   Tapa tornillo (T95)                                         12.00
I      Tornillo parker nº 10 x 11/2"                               12.00
MB31   Burlete cuña 4 mm (B31)                                      9.71
MB69   Burlete marco-premarco (B69)                                 4.00
MC14   Felpa 7 x 6 mm con Fin Seal (C14)                            7.63


 */