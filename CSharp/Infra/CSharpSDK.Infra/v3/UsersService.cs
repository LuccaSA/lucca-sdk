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
using Lucca.CSharpSDK.Domain;
using Lucca.CSharpSDK.Infra.Common;

namespace Lucca.CSharpSDK.Infra.v3
{
    public class UsersService : ApiService<User>, IUsersService
    {
		public UsersService(ApiSettings settings)
			: base(settings)
		{
			_baseUri = new Uri(settings.InstanceUri, "/api/v3/users");
		}
    }
}
