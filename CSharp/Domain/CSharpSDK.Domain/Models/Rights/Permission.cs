using RDD.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lucca.CSharpSDK.Domain.Models.Rights
{
	public class Permission : EntityBase<Permission, string>
	{
		public override string Id { get; set; }
		public override string Name { get; set; }
	}
}
