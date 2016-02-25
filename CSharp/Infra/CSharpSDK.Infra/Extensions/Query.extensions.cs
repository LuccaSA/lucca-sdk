using RDD.Domain;
using RDD.Domain.Models.Querying;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lucca.CSharpSDK.Infra.Extensions
{
    public static class QueryExtensions
    {
		public static string Serialize<TEntity>(this Query<TEntity> query)
			where TEntity : class, IEntityBase
		{
			return String.Join("&", query.Filters.Select(f =>
			{
				switch (f.Type)
				{
					case WhereOperand.Equals:
						{
							return String.Format("{0}={1}", f.Field, String.Join(",", f.Values.Cast<object>().Select(v => v.ToString()).ToArray()));
						}

					default:
						throw new NotImplementedException();
				}
			}).ToArray());
		}
    }
}
