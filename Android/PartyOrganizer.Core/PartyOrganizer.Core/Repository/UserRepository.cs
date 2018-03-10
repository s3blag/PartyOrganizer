﻿using System;
using System.Collections.Generic;
using System.Linq;
using PartyOrganizer.Core.Repository.Interfaces;

namespace PartyOrganizer.Core.Repository
{
    public class UserRepository : IUserRepository
    {
        private List<User> users = new List<User>();

        public IEnumerable<User> GetAll()
        {
            return users;
        }

        public User GetByID(int ID)
        {
            return users.FirstOrDefault(x => x.ID == ID);
        }

        public IEnumerable<User> GetFriends(User user)
        {
            return user.Friends;
        }

        public void Add(User entity)
        {
            users.Add(entity);
        }

        public void Remove(User entity)
        {
            users.Remove(entity);
        }

        //only for unit tests purposes, it will be removed in the final ver
        public void RemoveAll()
        {
            users.RemoveAll(null);
        }

        public void Populate()
        {
            Add(new User()
            {
                ID = 0,
                Name = "Sebastian",
                Surname = "Łągiewski",
                Online = true,
                Email = "s3blag@gmail.com",
                PhoneNumber = "48123456789",
                ImagePath = "247324/abstract-user-flat-1.png",
                Friends = null
            });
            Add(new User()
            {
                ID = 1,
                Name = "Klaudia",
                Surname = "Łągiewska",
                Online = false,
                Email = "sl@gmail.com",
                PhoneNumber = "48123423139",
                ImagePath = "247319/abstract-user-flat-3.png",
                Friends = new List<User>
                {
                    new User()
                    {
                        ID = 5,
                        Name = "Friend1",
                        Surname = "Surname1",
                        Online = true,
                        Email = "s3blag1@gmail.com",
                        PhoneNumber = "48123456781",
                        ImagePath = "247324/abstract-user-flat-1.png",
                        Friends = null
                    },
                    new User()
                    {
                        ID = 6,
                        Name = "Friend2",
                        Surname = "Surname2",
                        Online = true,
                        Email = "s3blag2@gmail.com",
                        PhoneNumber = "48123456782",
                        ImagePath = "247324/abstract-user-flat-1.png",
                        Friends = null
                    },
                    new User()
                    {
                        ID = 7,
                        Name = "Friend3",
                        Surname = "Surname3",
                        Online = true,
                        Email = "s3blag3@gmail.com",
                        PhoneNumber = "48123456783",
                        ImagePath = "247324/abstract-user-flat-1.png",
                        Friends = null
                    }
                }
            });
            Add(new User()
            {
                ID = 2,
                Name = "Typical",
                Surname = "User",
                Online = false,
                Email = "wafel@gmail.com",
                PhoneNumber = "48123423000",
                ImagePath = "247320/abstract-user-flat-4.png",
                Friends = null
            });
        }
    }
}