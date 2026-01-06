create table public.users (
  id uuid not null default gen_random_uuid (),
  username character varying(255) not null,
  password character varying(255) not null,
  avatar_url character varying(500) null,
  favorite_team_id integer null,
  favorite_player_id integer null,
  favorite_color character varying(7) null default '#0066cc'::character varying,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint users_pkey primary key (id),
  constraint users_username_key unique (username)
) TABLESPACE pg_default;

create index IF not exists idx_users_username on public.users using btree (username) TABLESPACE pg_default;
