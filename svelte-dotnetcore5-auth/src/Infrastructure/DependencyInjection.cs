﻿using SvelteStore.Application.Common.Interfaces;
using SvelteStore.Infrastructure.Files;
using SvelteStore.Infrastructure.Identity;
using SvelteStore.Infrastructure.Persistence;
using SvelteStore.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Linq;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.ApiAuthorization.IdentityServer;

namespace SvelteStore.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            if (configuration.GetValue<bool>("UseInMemoryDatabase"))
            {
                services.AddDbContext<ApplicationDbContext>(options =>
                    options.UseInMemoryDatabase("skeletonDb"));
            }
            else
            {
                services.AddDbContext<ApplicationDbContext>(options =>
                    options.UseSqlServer(
                        configuration.GetConnectionString("DefaultConnection"),
                        b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));
            }

            services.AddScoped<IApplicationDbContext>(provider => provider.GetService<ApplicationDbContext>());

            services.AddScoped<IDomainEventService, DomainEventService>();

            services
                .AddDefaultIdentity<ApplicationUser>()
                .AddRoles<IdentityRole>()
                .AddEntityFrameworkStores<ApplicationDbContext>();

            services.AddIdentityServer()
                //.AddApiAuthorization<ApplicationUser, ApplicationDbContext>(options =>
                //{
                //    options.Clients.AddIdentityServerSPA(
                //        "SvelteStore2", spa =>

                //        spa.WithRedirectUri("http://localhost:5000/authentication/login-callback")
                //            .WithLogoutRedirectUri(
                //                "http://localhost:5000/authentication/logout-callback"));

                //    options.ApiResources.AddApiResource("SvelteStore2API", resource =>
                //        resource.WithScopes("a", "b", "c"));
                //});
                .AddApiAuthorization<ApplicationUser, ApplicationDbContext>(options =>
                {
                    var client = options.Clients.SingleOrDefault(c => c.ClientId == "SvelteStore");
                    client.AllowOfflineAccess = true;
                    client.UpdateAccessTokenClaimsOnRefresh = true;
                })
                .AddRedirectUriValidator<CustomRedirectUriValidator>();
            //x.AllowAuthorizationCodeFlow().AllowRefreshTokenFlow();

            services.AddTransient<IDateTime, DateTimeService>();
            services.AddTransient<IIdentityService, IdentityService>();
            services.AddTransient<ICsvFileBuilder, CsvFileBuilder>();

            services.AddAuthentication()
                .AddIdentityServerJwt(); 
            
            services.AddAuthorization(options =>
            {
                options.AddPolicy("CanPurge", policy => policy.RequireRole("Administrator"));
            });

            return services;
        }
    }
}