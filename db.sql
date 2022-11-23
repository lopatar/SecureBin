create table pastes
(
    urlCode char(16) not null primary key,
    content text     not null,
    password varchar(100) not null,
    burnOnRead tinyint(1) not null
);