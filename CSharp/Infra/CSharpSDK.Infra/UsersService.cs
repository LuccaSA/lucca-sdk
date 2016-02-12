using Lucca.CSharpSDK.Domain.Models.Organization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Cache;
using System.Text;
using RDD.Domain.Contexts;
using RDD.Domain;
using Newtonsoft.Json;
using RDD.Domain.Exceptions;

namespace Lucca.CSharpSDK.Infra
{
    public class UsersService : ApiService<User>
    {
		public UsersService(ApiSettings settings)
			: base(settings)
		{
			BaseUri = new Uri(settings.InstanceUri, String.Format("/api/{0}/users", settings.ApiVersion));
		}
    }
}
