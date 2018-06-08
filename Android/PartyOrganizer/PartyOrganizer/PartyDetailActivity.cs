﻿using Android.App;
using Android.OS;
using Android.Support.V4.View;
using Android.Support.V4.App;
using Firebase.Xamarin.Auth;
using PartyOrganizer.Adapters;
using PartyOrganizer.Core.Auth;
using PartyOrganizer.Core.Repository;
using PartyOrganizer.Core.Repository.Interfaces;
using PartyOrganizer.Fragments;
using Xamarin.Facebook;
using System.Collections.Generic;

namespace PartyOrganizer
{
    [Activity(Label = "Party", MainLauncher = false)]
    public class PartyDetailActivity : FragmentActivity
    {
        private PartyInfoFragment _partyInfoFragment;
        private PartyItemsFragment _partyItemsFragment;
        private PartyMembersFragment _partyMembersFragment;
        private PartyPendingFragment _partyPendingFragment;
        private IPartyRepositoryAsync _partyRepository;      

        protected async override void OnCreate(Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);
            SetContentView(Resource.Layout.PartyDetailView);

            var authLink = await FirebaseAuthLinkWrapper.GetAuthLink(FirebaseAuthType.Facebook, AccessToken.CurrentAccessToken.Token);
            _partyRepository = new PersistantPartyRepository(authLink);

            var selectedPartyID = Intent.Extras.GetString("selectedPartyID");
            var party = await _partyRepository.GetById(selectedPartyID);

            CreateFragments(authLink, party);

            var viewPager = FindViewById<ViewPager>(Resource.Id.viewpager);
            viewPager.Adapter = new ViewPagerFragmentsAdapter(SupportFragmentManager,
                new List<Android.Support.V4.App.Fragment>
                {
                    _partyInfoFragment,
                    _partyItemsFragment,
                    _partyMembersFragment,
                    _partyPendingFragment
                });
        }

        private void CreateFragments(FirebaseAuthLink authLink, Core.Model.Party.Party party)
        {
            _partyInfoFragment = new PartyInfoFragment(party);
            _partyItemsFragment = new PartyItemsFragment(party, _partyRepository, authLink);
            _partyMembersFragment = new PartyMembersFragment(party);
            _partyPendingFragment = new PartyPendingFragment(party, _partyRepository, authLink);
        }
    }
}