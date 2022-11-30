
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema piuts_db
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema piuts_db
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `piuts_db` DEFAULT CHARACTER SET utf8 ;
USE `piuts_db` ;


create table categories
(
    id            varchar(36)                        not null
        primary key,
    name          varchar(36)                        not null,
    status        tinyint(1)                         not null,
    display_order tinyint auto_increment,
    createdAt     datetime default CURRENT_TIMESTAMP not null,
    updatedAt     datetime default CURRENT_TIMESTAMP not null,
    serviceId     varchar(36)                        null,
    constraint categories_display_order_uindex
        unique (display_order),
    constraint categories_id_uindex
        unique (id)
);

create table cities
(
    id        varchar(36)                          not null
        primary key,
    code      varchar(5)                           not null,
    name      varchar(36)                          not null,
    status    tinyint(1) default 1                 not null,
    createdAt datetime   default CURRENT_TIMESTAMP not null,
    updatedAt datetime   default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
    constraint cities_id_uindex
        unique (id)
);

create table countries
(
    id        varchar(36)                          not null
        primary key,
    code      varchar(5)                           not null,
    name      varchar(36)                          not null,
    status    tinyint(1) default 1                 not null,
    createdAt datetime   default CURRENT_TIMESTAMP not null,
    updatedAt datetime   default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
    currency  varchar(36)                          null
);

create table interests
(
    id          varchar(36)                          not null
        primary key,
    name        varchar(36)                          not null,
    description text                                 null,
    status      tinyint(1) default 1                 not null,
    createdAt   datetime   default CURRENT_TIMESTAMP not null,
    updatedAt   datetime   default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP
);

create table matchs
(
    id            varchar(36)                        not null
        primary key,
    userId        varchar(36)                        not null,
    serviceUserId varchar(36)                        not null comment 'Match Id o servicio',
    matched       tinyint(1)                         not null,
    matchedAt     datetime                           null,
    createdAt     datetime default CURRENT_TIMESTAMP not null,
    updatedAt     datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP
);

create index fk_matches_user_matched_idx
    on matchs (serviceUserId);

create index fk_matches_user_requested_idx
    on matchs (userId);

create table payment_types
(
    id          varchar(36)                          not null
        primary key,
    name        varchar(36)                          not null,
    description varchar(45)                          not null,
    status      tinyint(1) default 1                 not null,
    createdAt   datetime   default CURRENT_TIMESTAMP not null,
    updatedAt   datetime   default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP
);

create table roles
(
    id          varchar(36)                          not null
        primary key,
    name        varchar(36)                          not null,
    description varchar(45)                          not null,
    status      tinyint(1) default 1                 not null,
    createdAt   datetime   default CURRENT_TIMESTAMP not null,
    updatedAt   datetime   default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP
);

create table services
(
    id          varchar(36)                        not null
        primary key,
    name        varchar(36)                        not null,
    description varchar(500)                       not null,
    createdAt   datetime default CURRENT_TIMESTAMP not null,
    updatedAt   datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP
);

create table state_services
(
    id          varchar(36)                        not null
        primary key,
    name        varchar(36)                        not null,
    description varchar(45)                        not null,
    createdAt   datetime default CURRENT_TIMESTAMP not null,
    updatedAt   datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP
);

create table users
(
    id            varchar(36)                          not null
        primary key,
    password      text                                 not null,
    username      varchar(45)                          not null,
    name          varchar(45)                          not null,
    lastname      varchar(45)                          not null,
    age           int                                  not null,
    email         varchar(45)                          null,
    mobilePhone   varchar(45)                          not null,
    gender        varchar(5)                           null,
    cityId        varchar(36)                          not null,
    countryId     varchar(36)                          not null,
    coordinates   varchar(36)                          null,
    tokenFacebook varchar(100)                         null,
    status        tinyint(1) default 1                 not null,
    validatedAt   datetime                             null,
    description   text                                 null,
    createdAt     datetime   default CURRENT_TIMESTAMP not null,
    updatedAt     datetime   default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
    latitude      float                                null,
    longitude     float                                null,
    tokenGoogle   varchar(100)                         null,
    interest      json                                 null,
    constraint mobilePhone_UNIQUE
        unique (mobilePhone),
    constraint fk_users_cities1
        foreign key (cityId) references cities (id),
    constraint fk_users_countries1
        foreign key (countryId) references countries (id)
);

create table collections
(
    id          varchar(36)                        not null
        primary key,
    userId      varchar(36)                        not null,
    userMatchId varchar(36)                        not null comment 'Match Id o servicio',
    matched     tinyint(1)                         not null,
    matchedAt   datetime                           null,
    createdAt   datetime default CURRENT_TIMESTAMP not null,
    updatedAt   datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
    constraint collections_users_id_fk
        foreign key (userId) references users (id),
    constraint collections_users_id_fk_2
        foreign key (userMatchId) references users (id)
);

create index fk_matches_user_matched_idx
    on collections (userMatchId);

create index fk_matches_user_requested_idx
    on collections (userId);

create table credit_cards
(
    id        varchar(36)                          not null
        primary key,
    users_id  varchar(36)                          not null,
    token     varchar(36)                          not null,
    status    tinyint(1) default 1                 not null,
    main      tinyint(1) default 1                 not null,
    createdAt datetime   default CURRENT_TIMESTAMP not null,
    updatedAt datetime   default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
    constraint credit_cards_users_id_fk
        foreign key (users_id) references users (id)
);

create index fk_credit_cards_users1_idx
    on credit_cards (users_id);

create table interest_users
(
    id          varchar(36)                        not null
        primary key,
    interest_id varchar(36)                        not null,
    users_id    varchar(36)                        not null,
    createdAt   datetime default CURRENT_TIMESTAMP not null,
    updatedAt   datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
    constraint fk_interest_has_users_interest1
        foreign key (interest_id) references interests (id),
    constraint interest_users_users_id_fk
        foreign key (users_id) references users (id)
);

create index fk_interest_has_users_interest1_idx
    on interest_users (interest_id);

create index fk_interest_has_users_users1_idx
    on interest_users (users_id);

create table services_users
(
    id             varchar(36)                        not null
        primary key,
    userId         varchar(36)                        not null,
    stateServiceId varchar(36)                        not null,
    services_id    varchar(36)                        not null,
    value          float    default 0                 not null,
    description    text                               null,
    image_user     text                               null,
    createdAt      datetime default CURRENT_TIMESTAMP not null,
    updatedAt      datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
    status         tinyint(1)                         null,
    dateService    datetime                           not null,
    constraint fk_services_state_services1
        foreign key (stateServiceId) references state_services (id),
    constraint fk_services_user_services1
        foreign key (services_id) references services (id),
    constraint services_users_users_id_fk
        foreign key (userId) references users (id)
);

create table offers
(
    id        varchar(36)                        not null
        primary key,
    userId    varchar(36)                        not null,
    serviceId varchar(36)                        not null,
    status    varchar(45)                        not null,
    value     float    default 0                 not null,
    createdAt datetime default CURRENT_TIMESTAMP not null,
    updatedAt datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
    constraint fk_offers_services
        foreign key (serviceId) references services_users (id)
);

create index fk_offers_services_idx
    on offers (serviceId);

create index fk_offers_users_idx
    on offers (userId);

create table service_categories
(
    id         varchar(36)                        not null
        primary key,
    serviceId  varchar(36)                        not null,
    categoryId varchar(36)                        not null,
    createdAt  datetime default CURRENT_TIMESTAMP not null,
    updatedAt  datetime default CURRENT_TIMESTAMP not null,
    constraint service_categories_categories_id_fk
        foreign key (categoryId) references categories (id),
    constraint service_categories_services_users_id_fk
        foreign key (serviceId) references services_users (id)
);

create table service_images
(
    id        varchar(36)                        not null
        primary key,
    serviceId varchar(36)                        not null,
    url       text                               null,
    createdAt datetime default CURRENT_TIMESTAMP null,
    updatedAt datetime default CURRENT_TIMESTAMP null,
    constraint service_images_id_uindex
        unique (id),
    constraint service_images_services_users_id_fk
        foreign key (serviceId) references services_users (id)
);

create index fk_service_users_idx
    on services_users (userId);

create index fk_services_state_services1_idx
    on services_users (stateServiceId);

create index fk_services_user_services1_idx
    on services_users (services_id);

create table transactions
(
    id            varchar(36)                        not null
        primary key,
    userId        varchar(36)                        not null,
    serviceId     varchar(36)                        not null,
    paymentTypeId varchar(36)                        not null,
    payInfo       varchar(45)                        not null,
    status        varchar(45)                        null,
    total         float                              not null comment '''',
    createdAt     datetime default CURRENT_TIMESTAMP not null,
    paymentAt     datetime                           null,
    updatedAt     datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
    constraint fk_transactions_payment_types1
        foreign key (paymentTypeId) references payment_types (id),
    constraint fk_transactions_services1
        foreign key (serviceId) references services_users (id),
    constraint transactions_users_id_fk
        foreign key (userId) references users (id)
);

create index fk_transactions_payment_types1_idx
    on transactions (paymentTypeId);

create index fk_transactions_services1_idx
    on transactions (serviceId);

create index fk_transactions_users_idx
    on transactions (userId);

create table user_images
(
    id        varchar(36)                          not null
        primary key,
    userId    varchar(36)                          not null,
    url       varchar(45)                          not null,
    public    tinyint(1) default 1                 not null,
    valid     tinyint(1) default 0                 not null,
    createdAt datetime   default CURRENT_TIMESTAMP not null,
    updatedAt datetime   default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
    constraint user_images_users_id_fk
        foreign key (userId) references users (id)
);

create index fk_userId_idx
    on user_images (userId);

create table user_roles
(
    id        varchar(36)                        not null
        primary key,
    userId    varchar(36)                        not null,
    rolesId   varchar(36)                        not null,
    createdAt datetime default CURRENT_TIMESTAMP not null,
    updatedAt datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
    constraint fk_user_roles_roles1
        foreign key (rolesId) references roles (id),
    constraint user_roles_users_id_fk
        foreign key (userId) references users (id)
);

create index fk_userRoles_userId_idx
    on user_roles (userId);

create index fk_user_roles_roles1_idx
    on user_roles (rolesId);

create table user_services_salesmans
(
    id         varchar(36)                        not null
        primary key,
    userId     varchar(36)                        not null,
    servicesId varchar(36)                        not null,
    createdAt  datetime default CURRENT_TIMESTAMP not null,
    updatedAt  datetime default CURRENT_TIMESTAMP not null,
    constraint user_services_salesman_id_uindex
        unique (id),
    constraint user_services_salesman_services_id_fk
        foreign key (servicesId) references services (id),
    constraint user_services_salesman_users_id_fk
        foreign key (userId) references users (id)
);

create index fk_users_cities1_idx
    on users (cityId);

create index fk_users_countries1_idx
    on users (countryId);
