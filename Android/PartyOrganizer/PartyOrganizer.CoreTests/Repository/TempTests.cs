﻿using System.Threading.Tasks;
using Firebase.Xamarin.Database;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using PartyOrganizer.Core.Repository;
using PartyOrganizer.Core.Repository.Interfaces;

namespace PartyOrganizer.CoreTests.Repository
{
    [TestClass]
    public class TempTests
    {
        readonly IPartyRepositoryAsync repository = new WebPartyRepository();
        FirebaseClient _fb = new FirebaseClient("https://fir-test-420af.firebaseio.com/");

        [TestMethod]
        public async Task GetLookupPartiesAsync()
        {
            var id = "amXgDFj6WcOQkffgtN3pOJupXEz2";
            var parties = await repository.GetPartiesWithUser(id);


        }

        [TestMethod]
        public async Task GetPartyByIdAsync()
        {
            var id = "-LDYmodu8aySj6HK9H0n";

            var party = await repository.GetById(id);
                        
        }
    }
}