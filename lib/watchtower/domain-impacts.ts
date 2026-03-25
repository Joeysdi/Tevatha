// lib/watchtower/domain-impacts.ts
// Maps each threat domain to the countries most affected, with globe label text.
// ISO codes are numeric strings matching COUNTRY_RISK in geo-risk.ts.

export interface DomainCountryImpact {
  iso:   string;           // numeric ISO-3166-1 (no leading zeros, matches parseInt output)
  role:  "primary" | "secondary" | "watch";
  label: string;           // short globe overlay label (≤18 chars)
}

export interface DomainImpact {
  id:        string;        // matches DOMAINS[].id
  countries: DomainCountryImpact[];
}

export const DOMAIN_IMPACTS: DomainImpact[] = [
  {
    id: "nuclear",
    countries: [
      { iso: "840", role: "primary",   label: "NEW START LAPSE"  },  // USA
      { iso: "643", role: "primary",   label: "DOCTRINE SHIFT"   },  // Russia
      { iso: "156", role: "primary",   label: "1K WARHEADS '30"  },  // China
      { iso: "408", role: "primary",   label: "50 WARHEADS"      },  // North Korea
      { iso: "586", role: "secondary", label: "170 WARHEADS"     },  // Pakistan
      { iso: "356", role: "secondary", label: "172 WARHEADS"     },  // India
      { iso: "826", role: "secondary", label: "B61-12 HOST"      },  // UK
      { iso: "250", role: "secondary", label: "B61-12 HOST"      },  // France
      { iso: "276", role: "watch",     label: "B61-12 STORAGE"   },  // Germany
      { iso: "56",  role: "watch",     label: "B61-12 STORAGE"   },  // Belgium
      { iso: "380", role: "watch",     label: "B61-12 STORAGE"   },  // Italy
      { iso: "792", role: "watch",     label: "B61-12 STORAGE"   },  // Turkey
    ],
  },
  {
    id: "cyber",
    countries: [
      { iso: "840", role: "primary",   label: "SALT TYPHOON HIT"  },  // USA
      { iso: "156", role: "primary",   label: "SALT TYPHOON SRC"  },  // China
      { iso: "643", role: "primary",   label: "MIDNIGHT BLIZZARD" },  // Russia
      { iso: "376", role: "secondary", label: "AI KILL-CHAIN"     },  // Israel
      { iso: "826", role: "secondary", label: "80 NATIONS HIT"    },  // UK
      { iso: "276", role: "secondary", label: "CRITICAL INFRA"    },  // Germany
      { iso: "392", role: "watch",     label: "DEFENSE LEAK"      },  // Japan
      { iso: "36",  role: "watch",     label: "FIVE EYES TARGET"  },  // Australia
    ],
  },
  {
    id: "civil",
    countries: [
      { iso: "156", role: "primary",   label: "TAIWAN BLOCKADE"   },  // China
      { iso: "804", role: "primary",   label: "ACTIVE FRONTLINE"  },  // Ukraine
      { iso: "364", role: "primary",   label: "NEAR WEAPONS-GRADE"},  // Iran
      { iso: "729", role: "primary",   label: "LARGEST DISPLACED" },  // Sudan
      { iso: "376", role: "primary",   label: "ACTIVE CONFLICT"   },  // Israel
      { iso: "408", role: "secondary", label: "ICBM EXPANSION"    },  // North Korea
      { iso: "104", role: "watch",     label: "JUNTA COLLAPSE"    },  // Myanmar
    ],
  },
  {
    id: "economic",
    countries: [
      { iso: "840", role: "primary",   label: "$38.4T DEBT"       },  // USA
      { iso: "156", role: "primary",   label: "e-CNY $986B"       },  // China
      { iso: "392", role: "secondary", label: "DEBT 264% GDP"     },  // Japan
      { iso: "276", role: "secondary", label: "RECESSION"         },  // Germany
      { iso: "250", role: "secondary", label: "FISCAL STRESS"     },  // France
      { iso: "826", role: "watch",     label: "STAGNATION"        },  // UK
      { iso: "356", role: "secondary", label: "GROWTH vs FRAGILITY"},  // India
      { iso: "76",  role: "watch",     label: "CURRENCY RISK"     },  // Brazil
    ],
  },
  {
    id: "bio",
    countries: [
      { iso: "840", role: "primary",   label: "H5N1 DAIRY BELT"   },  // USA
      { iso: "356", role: "primary",   label: "MPXV SPREAD"       },  // India
      { iso: "180", role: "primary",   label: "MPXV EPICENTER"    },  // Congo DRC
      { iso: "76",  role: "secondary", label: "DENGUE SURGE"      },  // Brazil
      { iso: "156", role: "secondary", label: "H9N2 MUTATIONS"    },  // China
      { iso: "586", role: "watch",     label: "OUTBREAK RISK"     },  // Pakistan
      { iso: "818", role: "watch",     label: "AVIAN FLU SPREAD"  },  // Egypt
    ],
  },
  {
    id: "climate",
    countries: [
      { iso: "50",  role: "primary",   label: "SEA LEVEL THREAT"  },  // Bangladesh
      { iso: "360", role: "primary",   label: "COASTAL EXPOSURE"  },  // Indonesia
      { iso: "76",  role: "secondary", label: "AMAZON DIEBACK"    },  // Brazil
      { iso: "729", role: "secondary", label: "DROUGHT + CONFLICT"},  // Sudan
      { iso: "356", role: "secondary", label: "HEAT MORTALITY"    },  // India
      { iso: "840", role: "secondary", label: "EXTREME HEAT"      },  // USA
      { iso: "156", role: "watch",     label: "FLOOD + DROUGHT"   },  // China
      { iso: "24",  role: "watch",     label: "COASTAL EROSION"   },  // Angola
    ],
  },
];
